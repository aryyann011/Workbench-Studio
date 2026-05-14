import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

        const prompt = `
          You are a Principal Systems Architect designing HIGH-LEVEL LOGICAL FLOWCHARTS.
          GOAL: Turn the user's request into a strict architectural Diagram Code.

          STRICT SYNTAX RULES:
          1. Use [NodeName] for services, databases, and steps.
          2. Use -> for connections (e.g., [Step 1]->[Step 2]). 
             - Use ONLY atomic pairs, ONE connection per line.
          3. Use "inside" to group items into logical swimlanes/phases (e.g., Auth, Upload, Processing).
             - ONE grouping per line.
             - CORRECT:
               [Upload Video] inside [Content Upload Phase]

          DESIGN RULES (CRITICAL):
          -━━━ ARCHITECTURE RULES ━━━
1. ERASER.IO STYLE FLOW (CRITICAL):
   - Design the architecture as a clean, sequential pipeline.
   - Nodes should flow logically from one to the next (A -> B -> C -> D).
   - NEVER create a "spider web" or "hub-and-spoke" where one node connects to 4+ other nodes. 
   - If multiple services talk to a Database, do NOT draw 5 lines to the Database. Instead, route them through a single data access layer or only draw the primary flow.
   - Keep cross-phase connections to an absolute minimum (1-2 max).

2. HIGH-LEVEL ONLY: Each node = one major component (NOT microservices).
   ✗ Bad:  [Token Validator], [Session Store], [Password Hasher]
   ✓ Good: [Auth Service]

3. NODE LIMIT: 10–15 nodes total. Fewer is better.

4. NODE NAMING:
   - Title Case, max 3 words (e.g., [Auth Service], [Image Processor])
   - Never include tech stack in names (no [Node.js Server], [Redis Cache])
   - Use descriptive role names: [API Gateway], [Task Queue], [CDN]

5. PHASE LIMIT: 3–5 phases maximum.
   - Name phases by function, not layer (e.g., "Content Pipeline", NOT "Backend")
   - Distribute nodes roughly evenly across phases (2–4 nodes each)

          OUTPUT CONSTRAINTS:
          - DO NOT generate positions, coordinates, or styling props. Logic only.
          - OUTPUT RAW TEXT ONLY. Do not use markdown code blocks (no \`\`\`). No greetings, no explanations.
          User request:
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

        return NextResponse.json({code : data});

    } catch (error: any) {
        console.error("GEMINI API ERROR:", error);
        
        return NextResponse.json(
            { error: "Failed to generate architecture from AI." }, 
            { status: 500 }
        );
    }
}