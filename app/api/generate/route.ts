import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCachedPromptResult, saveCachePromptResult } from "@/actions/promptCache";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { error } from "console";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: "Invalid api key" }, { status: 400 });
        }

        const body = await request.json();
        const text = body?.text;
        const skipCache = body?.skipCache === true;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        if (!skipCache) {
            try {
                const cacheResult = await getCachedPromptResult(text);
                if (cacheResult.success && cacheResult.cached && cacheResult.code) {
                    return NextResponse.json({
                        code: cacheResult.code,
                        fromCache: true,
                        cacheType: cacheResult.type,
                        similarity: cacheResult.similarity
                    });
                }
            } catch (cacheError) {
                console.warn("Cache lookup failed, proceeding with AI:", cacheError);
            }
        }

        const prompt = `You are a Principal Systems Architect. Convert the user's request into a STRICT architectural diagram using the exact syntax below.

━━━ SYNTAX ━━━
• Nodes:       [Node Name]
• Connections: [Source] -> [Target]    (one per line, atomic pairs only)
• Grouping:    [Node] inside [Phase Name]  (one per line)

━━━ OUTPUT FORMAT (MANDATORY ORDER) ━━━
Section 1: Define ALL connections (one connection per line).
Section 2: Define ALL groupings (one "inside" per line).
Separate Section 1 and Section 2 with a single blank line.

━━━ EXAMPLE OUTPUT (MIMIC THIS EXACTLY) ━━━
[Client] -> [API Gateway]
[API Gateway] -> [Auth Service]
[Auth Service] -> [Logic Processor]
[Logic Processor] -> [Data Access Layer]
[Data Access Layer] -> [Primary Database]

[Client] inside [User Interaction]
[API Gateway] inside [Routing Phase]
[Auth Service] inside [Processing Phase]
[Logic Processor] inside [Processing Phase]
[Data Access Layer] inside [Storage Phase]
[Primary Database] inside [Storage Phase]

━━━ ARCHITECTURE RULES (CRITICAL FOR VISUAL CLEANLINESS) ━━━
1. STRICT LINEAR PIPELINE (NO JUNGLES):
   - You MUST force a sequential, waterfall flow (A -> B -> C -> D).
   - NO LOOPS OR CYCLES: Never connect a downstream node back to an upstream node. Data must flow in one direction only.
   - NO LAYER SKIPPING: Node A cannot connect directly to Node C. It must pass through Node B. (e.g., A Client cannot connect directly to a Database; it must go through an API/Service layer first).
   - NEVER create a "hub-and-spoke" pattern where one node connects to 3+ other nodes.
   - If multiple services need to talk to a database, route them through a single intermediate [Data Access] node.

2. HIGH-LEVEL ABSTRACTION: 
   - MAXIMUM of 10-12 nodes total. Fewer is better.
   - Combine granular microservices into single major components. (e.g., use one [Auth Service]).

3. NODE NAMING:
   - Title Case, max 3 words (e.g., [Task Queue]). 
   - Never use tech stack names. Use role names.

4. PHASE LIMIT & ORDER: 
   - Maximum 3-4 phases. 
   - Name them by lifecycle function (e.g., "Client Phase", "Processing Phase", "Storage Phase").
━━━ OUTPUT CONSTRAINTS ━━━
- RAW TEXT ONLY. No markdown formatting (no \`\`\`). No greetings. No explanations.
- NEVER output trailing or leading spaces around brackets. Use exactly [NodeA] -> [NodeB].
- Do NOT generate coordinates, positions, or styling.

━━━ USER REQUEST ━━━
${text}
`;

        let data = "";

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            data = response.text?.trim() || "";

            if (!data) {
                throw new Error("gemini returned an empty response")
            }
        } catch (error) {
            console.warn("gemini failed, switching to groq...", error)

            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.1,
                });

                data = chatCompletion.choices[0]?.message?.content?.trim() || "";

                if (!data) throw new Error("groq returned an empty response")
            } catch (error) {
                console.error("Both GEMINI and GROQ failed:", error);
                return NextResponse.json(
                    { error: "Failed to generate architecture." },
                    { status: 500 }
                );
            }
        }

        try {
            await saveCachePromptResult(text, data);
        } catch (saveError) {
            console.warn("Cache save failed:", saveError);
        }

        return NextResponse.json({ code: data, fromCache: false });

    } catch (error: any) {
        console.error("GEMINI API ERROR:", error);

        return NextResponse.json(
            { error: "Failed to generate architecture from AI." },
            { status: 500 }
        );
    }
}