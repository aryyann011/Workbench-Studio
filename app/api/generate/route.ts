import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCachedPromptResult, saveCachePromptResult } from "@/actions/promptCache";

const ai = new GoogleGenAI({
    apiKey : process.env.GOOGLE_API_KEY
});

export async function POST(request : Request){
    try {
        if(!process.env.GOOGLE_API_KEY){
            return NextResponse.json({error : "Invalid api key"}, {status : 400});
        }

        const body = await request.json();
        const text = body?.text;

        if (!text) {
             return NextResponse.json({error : "No text provided"}, {status : 400});
        }

        // Step 1: Check prompt cache first
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
            // Cache check failed silently — proceed with AI generation
            console.warn("Cache lookup failed, proceeding with AI:", cacheError);
        }

        // Step 2: Generate via AI (cache miss)
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
   - NEVER create a "hub-and-spoke" pattern where one node connects to 3+ other nodes.
   - If multiple services need to talk to a database, DO NOT draw multiple lines to the database. Instead, route them all through a single intermediate [Data Access] node.
   - Keep cross-phase connections to an absolute minimum.

2. HIGH-LEVEL ABSTRACTION: 
   - MAXIMUM of 10-12 nodes total. Fewer is better.
   - Combine granular microservices into single major components. (e.g., use one [Auth Service], NOT separate token/session nodes).

3. NODE NAMING:
   - Title Case, max 3 words (e.g., [Task Queue]). 
   - Never use tech stack names (e.g., no "Redis", "AWS", "Node.js"). Use role names.

4. PHASE LIMIT: 
   - Maximum 3-4 phases. Name them by lifecycle function (e.g., "Ingestion Phase", "Processing Phase").

━━━ OUTPUT CONSTRAINTS ━━━
- RAW TEXT ONLY. No markdown formatting (no \`\`\`). No greetings. No explanations.
- NEVER output trailing or leading spaces around brackets. Use exactly [NodeA] -> [NodeB].
- Do NOT generate coordinates, positions, or styling.

━━━ USER REQUEST ━━━
${text}
`;

        const response = await ai.models.generateContent({
          model : "gemini-2.5-flash",
          contents: prompt,
        });

        const data = response.text?.trim();

        if(!data){
            return NextResponse.json({error : "no response from api"}, {status : 400});
        }

        // Step 3: Save result to cache for future lookups
        try {
            await saveCachePromptResult(text, data);
        } catch (saveError) {
            // Cache save failed silently — don't block the response
            console.warn("Cache save failed:", saveError);
        }

        return NextResponse.json({code : data, fromCache: false});

    } catch (error: any) {
        console.error("GEMINI API ERROR:", error);
        
        return NextResponse.json(
            { error: "Failed to generate architecture from AI." }, 
            { status: 500 }
        );
    }
}