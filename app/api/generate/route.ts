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
    You are a System Architecture Generator.
      
      GOAL: Turn this request into a Diagram Code.
      STRICT SYNTAX RULES:
      1. Use [NodeName] for services/components.
      2. Use -> for connections.
      3. Format: [Source]->[Target]->[anotherTarget]->.... and so on. it can keep going on or you can start from new line also for new nodes 
      4. DO NOT generate positions or props. Logic only.
      5. OUTPUT RAW TEXT ONLY. No markdown, no explanations.

      User Request: "${text}"`

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

      const code = JSON.parse(data)

      
}