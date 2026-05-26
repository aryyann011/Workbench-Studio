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

        const prompt = `You are a Principal Systems Architect. Convert the user's request into a strictly formatted architectural diagram.

YOUR MISSION: Analyze the specific system requested. Do not output a generic web app. Identify the core engineering challenge of the system (e.g., Video Transcoding for YouTube, Fan-out/Caching for Twitter, Real-time WebSockets for Chat) and make sure those specific services are represented as nodes.

━━━ SYNTAX ━━━
• Nodes:       [Node Name]
• Connections: [Source] -> [Target]    (one per line, atomic pairs only)
• Grouping:    [Node] inside [Phase Name]  (one per line)

━━━ OUTPUT FORMAT (MANDATORY ORDER) ━━━
Section 1: Define ALL connections (one connection per line).
Section 2: Define ALL groupings (one "inside" per line).
Separate Section 1 and Section 2 with a single blank line.

━━━ EXAMPLE OUTPUT (MIMIC THIS BRANCHING STRUCTURE) ━━━
[Client App] -> [API Gateway]
[API Gateway] -> [Auth Service]
[API Gateway] -> [Timeline Cache]
[API Gateway] -> [Tweet Processor]
[Tweet Processor] -> [Event Broker]
[Event Broker] -> [Fan-Out Worker]
[Event Broker] -> [Analytics Engine]
[Fan-Out Worker] -> [Timeline Cache]
[Timeline Cache] -> [Graph Database]

[Client App] inside [Client Phase]
[API Gateway] inside [Routing Phase]
[Auth Service] inside [Processing Phase]
[Timeline Cache] inside [Processing Phase]
[Tweet Processor] inside [Processing Phase]
[Event Broker] inside [Asynchronous Phase]
[Fan-Out Worker] inside [Asynchronous Phase]
[Analytics Engine] inside [Storage Phase]
[Graph Database] inside [Storage Phase]

━━━ ARCHITECTURE RULES (CRITICAL FOR VISUAL CLEANLINESS) ━━━
1. CONTROLLED BRANCHING (DIRECTED ACYCLIC GRAPH):
   - Systems MUST branch out. (e.g., An API Gateway routing to 3 different services, or a Message Broker fanning out to multiple workers).
   - NO CYCLES OR LOOPS: Data flows left-to-right. A downstream node (like a Database) can NEVER point back to an upstream node (like an API Gateway).
   - KEEP IT READABLE: Do not connect every node to every other node.

2. CONTEXT-AWARE ABSTRACTION: 
   - MAXIMUM of 10-14 nodes total.
   - Name nodes specifically for the requested domain (e.g., use [Video Transcoder] or [Redis Timeline Cache] instead of a generic [Logic Processor]).

3. PHASE LIMIT & ORDER: 
   - Maximum 4 phases. 
   - Group nodes logically by their tier (e.g., "Client Tier", "API Layer", "Compute Cluster", "Data Infrastructure").

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