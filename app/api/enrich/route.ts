import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { label } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      const isDb = ["redis", "mongo", "postgres", "sql"].some(k => label.toLowerCase().includes(k));
      return NextResponse.json({ 
        icon: isDb ? 'Database' : 'Server',
        color: isDb ? '#3b82f6' : '#64748b' 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      You are a UI design assistant. 
      For the tech term "${label}", provide:
      1. The best matching Lucide React icon name.
      2. The official brand HEX color code for this technology.

      Return ONLY a valid JSON object. No markdown.
      Format: { "icon": "String", "color": "#HexCode" }

      Examples:
      "Redis" -> { "icon": "Database", "color": "#DC382D" }
      "Azure" -> { "icon": "Cloud", "color": "#0078D4" }
      "Nginx" -> { "icon": "Server", "color": "#009639" }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanJson = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);

  } catch (error) {
    console.error('Enrich Error:', error);
    return NextResponse.json({ icon: 'Server', color: '#64748b' });
  }
}