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
          You are a Principal Systems Architect.
          GOAL: Turn the user's request into a strict architectural Diagram Code.

          STRICT SYNTAX RULES:
          1. Use [NodeName] for services, databases, and components.
          2. Use -> for connections. 
             - Use ONLY atomic pairs, ONE connection per line.
          3. Use "inside" to group items into containers (like VPCs, Subnets, Clouds, or Clusters).
             - ONE grouping per line.
             - CORRECT:
               [React Frontend] inside [Public Subnet]
               [Postgres DB] inside [Private Subnet]

          ARCHITECTURAL DESIGN RULES (CRITICAL):
          - ALWAYS group related services inside logical containers. Do not leave nodes floating if they belong in a Cloud, VPC, or Server.
          - Avoid long linear chains. Real systems branch out.
          - ALWAYS introduce central routing nodes (e.g., [Load Balancer], [API Gateway], [Event Bus], [Kafka]) that fan out to multiple services.

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