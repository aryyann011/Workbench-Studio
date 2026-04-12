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
          - KEEP IT HIGH LEVEL. Do not generate micro-services. Use broad strokes. (e.g., Use one [Authentication] node, do NOT break it down into 5 separate nodes for tokens, session management, and DB lookups).
          - STRICT LIMIT: Generate a MAXIMUM of 12 to 15 nodes for the entire diagram. Less is more. Focus only on the core lifecycle.
          - Group nodes by their logical feature, NEVER by infrastructure.
          - Ensure nodes form a linear, step-by-step progression (A -> B -> C).

          OUTPUT CONSTRAINTS:
          - DO NOT generate positions, coordinates, or styling props. Logic only.
          - OUTPUT RAW TEXT ONLY. Do not use markdown code blocks (no \`\`\`). No greetings, no explanations.
          - PHASE LIMIT: You MUST group nodes into a MAXIMUM of 5 to 6 major phases. Do not fragment the architecture into 10 different phases.
          - STRICT LINEAR FLOW: Nodes must flow A -> B -> C. NEVER connect every single node to a central database if it causes lines to cross backwards over the diagram. Keep edges isolated to their specific phase wherever possible.

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