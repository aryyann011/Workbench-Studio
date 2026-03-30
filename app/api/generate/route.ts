import { NextResponse } from "next/server";
import { ApiError, GoogleGenAI } from "@google/genai";
import Error from "next/error";

const ai = new GoogleGenAI({
    apiKey : process.env.GOOGLE_API_KEY
})

export async function POST(request : Request){
    if(!process.env.GOOGLE_API_KEY){
        return NextResponse.json(
            {error : "Invalid api key"},
            {status : 400}
        )
    };

    const body = await request.json()
    const text = body?.text
    const prompt = `
      You are a Principal Systems Architect.
      GOAL: Turn the user's request into a strict architectural Diagram Code.

      STRICT SYNTAX RULES:
      1. Use [NodeName] for services/databases/components.
      2. Use -> for connections.
      3. Use ONLY atomic pairs, ONE connection per line.
        CORRECT:
        [API Gateway]->[Auth Service]
        [API Gateway]->[Payment Service]
        INCORRECT:
        [API Gateway]->[Auth Service]->[Payment Service]

      ARCHITECTURAL DESIGN RULES (CRITICAL):
      - Avoid long linear chains. Real systems branch out.
      - ALWAYS introduce central routing nodes (e.g., [Load Balancer], [API Gateway], [Event Bus], [Kafka]) that fan out to multiple services.
      - Show parallel processing where applicable (e.g., a service connecting to a [Database] AND a [Logging Service] simultaneously).

      4. DO NOT generate positions, coordinates, or props. Logic only.
      5. OUTPUT RAW TEXT ONLY. Do not use markdown code blocks. No greetings, no explanations.

      User request:
      ${text}
  `;

      const response = await ai.models.generateContent({
        model : "gemini-2.5-flash",
        contents: prompt,
      });

      const data = response.text?.trim()

      if(!data){
        return NextResponse.json(
            {error : "no response from api"},
            {status : 400},
        )
      }

      const code = data

      return NextResponse.json(
        {code : `${code}`}
      )

      
}