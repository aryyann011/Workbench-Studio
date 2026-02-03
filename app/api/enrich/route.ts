import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const label = body?.label;

    // ---------- HARD VALIDATION ----------
    if (typeof label !== "string" || !label.trim()) {
      return NextResponse.json(
        { icon: "Server", color: "#64748b" },
        { status: 200 }
      );
    }

    // ---------- LOCAL FALLBACK (NO AI) ----------
    const isDb = ["redis", "mongo", "postgres", "mysql", "sql"].some(k =>
      label.toLowerCase().includes(k)
    );

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        icon: isDb ? "Database" : "Server",
        color: isDb ? "#3b82f6" : "#64748b",
      });
    }

    // ---------- GEMINI PROMPT ----------
    const prompt = `
You are a UI design expert. Map the tech term "${label}" to a Lucide React icon name and a HEX color.
      
      CRITICAL VOCABULARY (Use these EXACT names):
      - Databases -> "Database"
      - Messaging/Kafka/Queues -> "MessageSquare"
      - Mobile/Phone -> "Smartphone"
      - Web/Browser -> "Globe"
      - AI/Bot -> "Bot"
      - Code/Python/JS -> "Code2"
      - Container/Docker -> "Box"
      - Storage/S3 -> "HardDrive"
      - Server/Nginx -> "Server"
      - Security/Firewall -> "Shield"
      - User/Client -> "User"
      - Analytics/Chart -> "BarChart"

      Rules:
      1. If the term fits one of these categories, use the EXACT name above.
      2. If it is unique (like "Wifi"), use the best Lucide match.
      3. Return valid JSON: { "icon": "String", "color": "#Hex" }

      Input: "${label}"
`.trim();

    // ---------- GEMINI CALL ----------
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    // ---------- JSON PARSE ----------
    const data = JSON.parse(text);

    if (!data.icon || !data.color) {
      throw new Error("Invalid JSON shape");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("ENRICH ERROR:", error);

    // ---------- NEVER BREAK UI ----------
    return NextResponse.json({
      icon: "Server",
      color: "#64748b",
    });
  }
}
