# Workbench Studio
**The Algorithmic Workspace for Collaborative System Design**

Workbench Studio is a high-performance, dual-engine environment designed to synchronize technical requirements and architectural visualization. It treats system design as a "compilation" process: converting unstructured natural language into deterministic, mathematically-positioned directed graphs.

---

## 🏗️ System Architecture & Engineering Logic

### 1. Dual-Engine Synchronization
The core of the application is a **Split-State Architecture**. We maintain two sources of truth that must remain in sync:
* **The Document Engine (Lexical):** A headless TipTap instance managing the markdown-based system requirements.
* **The Graph Engine (Visual):** A React Flow-driven infinite canvas rendering the system architecture.
* **The Bridge:** A custom middleware that parses markdown deltas and triggers the AI transformation layer to update the visual graph without losing manual user overrides.

### 2. Algorithmic Layout & Determinism
To solve the "messy canvas" problem inherent in whiteboard tools, Workbench Studio integrates **ELK.js (Eclipse Layout Kernel)**. 
* **Constraint-Based Positioning:** The system ignores the arbitrary $x,y$ coordinates often produced by LLMs. 
* **The Pipeline:** `AI Output (JSON) -> ELK Layout Engine -> React Flow Renderer`. 
* **Optimization:** We utilize layered layout algorithms to minimize edge crossings and optimize the visual hierarchy of complex microservices.

### 3. Distributed State & Multiplayer Consistency
Collaboration is handled via a **Real-Time Event Bus** (Pusher), utilizing a "Last-Write-Wins" conflict resolution strategy.
* **Optimistic UI:** Local state mutations (dragging a node, typing text) are applied instantly to the Zustand store for 0ms perceived latency.
* **Broadcast Layer:** Ephemeral data (mouse cursors, active selections) is broadcasted via WebSockets, while structural data (node additions, text edits) is persisted to MongoDB.
* **Debounced Persistence:** To prevent database thrashing, the system uses a 1000ms debounced write-through cache to the primary data store.

---

## 🛠️ High-Level Tech Stack

| Layer | Implementation |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router Architecture) |
| **Logic** | TypeScript (Strictly Typed Graph Schemas) |
| **Visuals** | React Flow + Tailwind CSS + Shadcn UI |
| **Orchestration** | Zustand (Client-side Centralized Store) |
| **Communication** | Pusher (WebSocket Pub/Sub) |
| **Intelligence** | Google Gemini 1.5 Flash (Structural JSON Enforcement) |
| **Database** | MongoDB Atlas (Mongoose ORM) |

---

## 🧬 Data Flow Model

1. **Input:** User describes a system (e.g., "Add a Load Balancer connected to 3 Web Servers").
2. **Transformation:** Gemini API processes the intent and returns a structured JSON Graph.
3. **Calculation:** ELK.js calculates the hierarchical positioning for the new nodes.
4. **Broadcast:** The new state is emitted to all collaborators and saved to the persistence layer.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
