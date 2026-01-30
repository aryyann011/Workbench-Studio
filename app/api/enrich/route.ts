import { NextResponse } from "next/server";
import {GoogleGenerativeAI} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request : Request){
    try{
        const body = await request.json()
        const label = body.label

        if(!label){
            return NextResponse.json({error : 'Label is required'}, { status : 400 })
        }

        if(!process.env.GOOGLE_API_KEY){
            console.warn("NO GOOGLE_API_KEY found. Returning mock response")

            const mockIcon = label.toLowerCase().includes('kafka') ? 'MessageSquare' : 'Server';
            return NextResponse.json({icon : mockIcon});
        }

        const model = genAI.getGenerativeModel({model : "gemini-pro"})
        const prompt = `
        You are an icon mapping system. 
        Map the technical term "${label}" to the absolute best matching icon name from the "Lucide React" library.
        
        Rules:
        1. Return ONLY the icon name (CamelCase). 
        2. No markdown, no explanations.
        3. If it's a database, return 'Database'.
        4. If unsure, return 'Server'.
        
        Example: "Postgres" -> "Database"
        Example: "iPhone" -> "Smartphone"
        Example: "Kafka" -> "MessageSquare"
        
        Input: "${label}"
        `;

        const result = await model.generateContent(prompt)
        const response = await result.response;
        const text = response.text().trim()
    }
}