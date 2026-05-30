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


const MODE_RULES: Record<string, string> = {
    minimal: `
   - CONSTRAINTS: Generate a strict MAXIMUM of 4-6 nodes total. 
   - PHASE LIMIT: MAXIMUM of 2 bounding phase boxes.
   - DESIGN INTERPRETATION: Abstract the entire infrastructure down to high-level conceptual modules only. Combine all granular backend layers into single massive block elements (e.g., [Application Core], [Data Platform]). Ideal for executive overviews and high-level business presentations.
   - EDGE BUDGET: Aim for 4-6 total connections maximum. Every connection must be essential.
   - NO CYCLES: Data flows strictly downstream. No bidirectional or return paths.`,

    balanced: `
   - CONSTRAINTS: Generate a balanced MAXIMUM of 8-11 nodes total.
   - PHASE LIMIT: MAXIMUM of 3 bounding phase boxes.
   - DESIGN INTERPRETATION: Focus heavily on structured cleanliness. Microservices must be grouped thoughtfully. If 4+ connections point to a shared boundary (like a database), you MUST route them through a single funnel aggregator node (e.g., [Data Access Layer] or [Service Hub]) to avoid crisscrossing wires on the output plane.
   - EDGE BUDGET: Aim for 8-14 total connections. Each phase should have at most 3 outgoing edges to the NEXT phase. Consolidate through gateway/router nodes if needed.
   - WITHIN-PHASE CYCLES ALLOWED: Bidirectional edges between nodes inside the SAME phase box are permitted (e.g., [Service A] -> [Cache] and [Cache] -> [Service A]). Cross-phase connections must remain strictly unidirectional downstream.`,

    detailed: `
   - CONSTRAINTS: Target a deep architecture grid of 10-14 highly granular nodes.
   - PHASE LIMIT: MAXIMUM of 4 bounding phase boxes.
   - DESIGN INTERPRETATION: Map out actual physical infrastructure realities. Explicitly represent independent ingestion points, background task queues, task workers, read-replicas, caching layers, and distinct event queues. Do not sacrifice technical depth for visual simplicity.
   - EDGE BUDGET: No hard edge ceiling. Ensure every connection represents a real communication path.
   - WITHIN-PHASE CYCLES ALLOWED: Bidirectional edges between nodes inside the SAME phase box are fully permitted. Cross-phase connections must remain strictly unidirectional downstream to prevent wire tangling across group boundaries.`,
};



const buildPrompt = (text: string, modeRules: string) => `You are a Principal Systems Architect converting user prompts into structurally explicit 2D architectural wireframes.

YOUR MISSION: Map out a production-grade architecture that reflects real enterprise communication systems. You must implement robust systems design practices (caches, async layers, databases, processors). Bounding boxes (Phases/Tiers) must be balanced horizontally and vertically across the grid plane to keep presentations readable, clean, and professional.

━━━ SYNTAX ━━━
• Nodes:       [Node Name]
• Connections: [Source] -> [Target]    (one per line, atomic pairs only)
• Grouping:    [Node] inside [Box Name]  (one per line - MANDATORY FOR EVERY NODE)

━━━ OUTPUT FORMAT (MANDATORY ORDER) ━━━
Section 1: Define ALL connections (one connection per line).
Section 2: Define ALL groupings (one "inside" per line).
Separate Section 1 and Section 2 with a single blank line.

━━━ CORE ARCHITECTURAL RULES ━━━
1. MANDATORY PLACEMENT BOUNDS (GROUPING):
   - EVERY SINGLE node generated must be placed inside a bounding phase box (e.g., [Ingestion Tier], [API Cluster], [Processing Infrastructure], [Data Layer]). 
   - No node can float loosely outside of an explicit parent group boundary box.

2. NO "GOD NODES" (ANTI-HUB-AND-SPOKE):
   - A single node MUST NOT have more than 3 incoming or outgoing connections.
   - If 4+ services need to talk to a shared resource, you MUST create a single [Data Access Layer] or [Aggregator] in front of it to act as a funnel.

3. GRAPH DENSITY & SYMMETRY:
   - Ensure nodes are distributed evenly inside their boxes. Do not leave boxes completely bare or create high-density line bottlenecks.
   - Name nodes specifically for the requested domain (e.g., [Video Transcoder], [Redis Timeline Cache], [Notification Fanout Queue]).

4. DIRECTIONAL ACCURACY: ALWAYS start the flow from the user's perspective. The origin of the graph should be [Client] or [Load Balancer], flowing downstream into Gateways, Services, and finally ending at Databases/Caches.

━━━ MODE-SPECIFIC CONSTRAINTS (OVERRIDING BALANCING TARGETS) ━━━
${modeRules}

━━━ OUTPUT CONSTRAINTS ━━━
- RAW TEXT ONLY. Do not wrap output in markdown code blocks (\`\`\`). No preamble, greetings, or conversational summaries.
- Never inject trailing or leading space padding inside structural brackets. Match exactly: [NodeA] -> [NodeB].
- Do NOT generate coordinates, positions, or styling.

━━━ USER REQUEST ━━━
${text}
`;



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
        const cacheCheckOnly = body?.cacheCheckOnly === true;
        const mode: string = body?.mode || 'balanced';

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        if (cacheCheckOnly) {
            try {
                const cacheResult = await getCachedPromptResult(text);
                if (cacheResult.success && cacheResult.cached && cacheResult.code) {
                    return NextResponse.json({
                        cacheHit: true,
                        code: cacheResult.code,
                        cacheType: cacheResult.type,
                        similarity: cacheResult.similarity,
                        cachedPrompt: (cacheResult as any).originalPrompt,
                    });
                }
            } catch (cacheError) {
                console.warn("Cache check failed:", cacheError);
            }
            return NextResponse.json({ cacheHit: false });
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

        const modeRules = MODE_RULES[mode] || MODE_RULES['balanced'];
        const prompt = buildPrompt(text, modeRules);

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
