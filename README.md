<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7.6-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

# Workbench Studio

**Turn a sentence into a production-ready system architecture diagram — in seconds.**

Workbench Studio is an AI-powered system design workspace that converts natural language prompts into interactive, editable architecture diagrams with real-time collaboration. Describe what you want to build, and watch it materialize as a professionally laid-out flowchart you can drag, edit, share, and export.

<p align="center">
  <em>Prompt → AI → Custom DSL → Graph Layout Engine → Interactive Canvas</em>
</p>

---

## ✨ Features

### 🤖 AI-Powered Compilation
Describe your system in plain English — "create a backend for an e-commerce platform..." — and our backend engine compiles your intent into a strict custom DSL. We leverage Gemini 2.5 Flash as a translation layer, passing the structured syntax down to our custom parser and layout engine to instantly render a mathematically routed architecture diagram.

### 🎨 Interactive Canvas
- **Drag-and-drop** nodes with independent child/parent movement
- **Auto-layout** via ELK.js (Eclipse Layout Kernel) — no manual positioning needed
- **Dynamic icons** and color-coded categories resolved per node label
- **Smooth zoom/pan** with minimap navigation
- **Export to PNG** at 3x resolution with dark background

### ✏️ Dual-Mode Editor
- **Code View** — Monaco Editor with a custom DSL syntax (`[Node A] -> [Node B]`, `[Node] inside [Phase]`)
- **Canvas View** — Full ReactFlow canvas with controls
- **Split View** — Resizable side-by-side editor + canvas
- **Run** to re-parse and re-layout at any time

### 👥 Real-Time Collaboration
- **Live cursors** — see collaborator mouse positions in real-time
- **Node locking** — when someone drags a node, others see a "locked by" indicator
- **Instant sync** — edge creation, node deletion, and undo/redo propagate to all users
- Powered by **Supabase Realtime** broadcast channels

### 🔐 Sharing & Access Control
- **Public share links** with tokenized access (32-char hex tokens)
- **Direct user invites** by Clerk user ID
- **Role-based permissions** — Owner / Collaborator (can edit) / Reader (view-only)
- **Optional expiry** on share links
- **Revoke access** at any time from the share management panel

### ⚡ Smart Prompt Caching
- **Two-tier cache** — exact SHA-256 hash match → character-level similarity scoring (70% threshold)
- **Cache badges** in the AI chat showing `Cached` or `85% match`
- **"Create New"** button to bypass cache and force a fresh AI generation
- **Auto-eviction** of stale, single-use entries after 30 days

### ↩️ Undo / Redo
Full action-based undo/redo stack supporting node deletion and node movement — scoped per user in collaborative sessions.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  Monaco   │  │  AI Chat │  │   ReactFlow Canvas     │ │
│  │  Editor   │  │  Panel   │  │   + ELK Auto-Layout    │ │
│  └────┬─────┘  └────┬─────┘  └───────────┬────────────┘ │
│       │              │                    │               │
│       └──────────────┴────────────────────┘               │
│                      │                                    │
│              ┌───────▼───────┐                            │
│              │  Zustand Store │ ◄──── Supabase Realtime   │
│              │  (nodes/edges/ │       (cursors, sync,     │
│              │   undo/redo)   │        node locking)      │
│              └───────┬───────┘                            │
└──────────────────────┼────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐  ┌─────▼─────┐  ┌───▼────┐
    │  /api/   │  │  Server   │  │  /api/  │
    │ generate │  │  Actions  │  │ share/  │
    │(Gemini)  │  │ (Prisma)  │  │validate │
    └────┬────┘  └─────┬─────┘  └───┬────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │   (Supabase)    │
              │                 │
              │  • Workspace    │
              │  • WorkspaceShare│
              │  • PromptCache  │
              └─────────────────┘
```

### The Pipeline

```
User Prompt ──► Gemini 2.5 Flash ──► Custom DSL Code ──► Parser ──► ELK.js Layout ──► ReactFlow Render
                                          │
                                    PromptCache
                                   (SHA-256 hash)
```

1. **Input** — User describes a system in the AI chat or writes DSL code directly
2. **Cache Check** — SHA-256 hash lookup → similarity scan of recent prompts
3. **AI Generation** — Gemini produces DSL syntax: `[Node] -> [Node]` connections + `[Node] inside [Phase]` groupings
4. **Parsing** — Custom regex-based parser extracts nodes, edges, and parent-child relationships
5. **Layout** — ELK.js (layered algorithm) computes optimal positions minimizing edge crossings
6. **Render** — ReactFlow renders the interactive diagram with dynamic icons, handles, and styling
7. **Persist** — Auto-saved to PostgreSQL every 2 seconds (debounced)
8. **Broadcast** — All mutations sync to collaborators via Supabase Realtime

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Framework** | Next.js 16 (App Router + Turbopack) | Full-stack React with server actions |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Database** | PostgreSQL (Supabase) | Persistent storage for workspaces, shares, cache |
| **ORM** | Prisma 7.6 with `@prisma/adapter-pg` | Type-safe database access with driver adapter |
| **Auth** | Clerk | Authentication, session management, user IDs |
| **AI** | Google Gemini 2.5 Flash | Natural language → architecture DSL conversion |
| **Canvas** | ReactFlow 11 | Interactive node-based diagram rendering |
| **Layout Engine** | ELK.js | Algorithmic graph layout (layered, orthogonal routing) |
| **Code Editor** | Monaco Editor | VS Code-grade editing experience |
| **State** | Zustand | Client-side centralized store with undo/redo |
| **Real-time** | Supabase Realtime | WebSocket broadcast for live collaboration |
| **Styling** | Tailwind CSS 4 + Shadcn UI | Component library with dark mode |
| **Export** | html-to-image | High-res PNG export (3x pixel ratio) |

---

## 📦 Database Schema

Three core tables powering the application:

```
Workspace (1) ◄────► (N) WorkspaceShare
    │
    │  id, userId, name, code,
    │  canvas_nodes (JSONB), canvas_edges (JSONB),
    │  createdAt, updatedAt
    │
    └──► WorkspaceShare
            id, workspaceId, userId?, shareToken?,
            role (OWNER|COLLABORATOR|READER),
            createdBy, expiresAt

PromptCache (standalone)
    id, userId, promptText, promptHash (SHA-256 unique),
    generatedCode, canvas_nodes, canvas_edges,
    usageCount, lastUsed, createdAt
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Supabase](https://supabase.com) free tier)
- [Clerk](https://clerk.com) account (free tier)
- [Google AI Studio](https://aistudio.google.com) API key (Gemini access)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/workbench-studio.git
cd workbench-studio
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Google Gemini
GOOGLE_API_KEY="your-gemini-api-key"

# Supabase (for Realtime only)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — log in via Clerk, create a workspace, and start designing.

---

## 📁 Project Structure

```
workbench-studio/
├── app/
│   ├── page.tsx                    # Dashboard (workspace list)
│   ├── dashboard/[id]/page.tsx     # Workspace editor
│   ├── share/[token]/page.tsx      # Shared workspace viewer
│   ├── api/
│   │   ├── generate/route.ts       # AI generation endpoint
│   │   ├── enrich/route.ts         # Node icon resolution
│   │   └── share/
│   │       ├── save/route.ts       # Collaborative save
│   │       └── validate/route.ts   # Share token validation
│   └── layout.tsx                  # Root layout (Clerk + theme)
├── actions/
│   ├── workspace.ts                # Workspace CRUD server actions
│   ├── share.ts                    # Sharing system server actions
│   └── promptCache.ts             # Cache operations server actions
├── components/
│   ├── reactFlow/
│   │   ├── diagramCanvas.tsx       # Main ReactFlow canvas
│   │   ├── systemNode.tsx          # Custom node component
│   │   └── systemGroupNode.tsx     # Group/phase container
│   ├── editor/
│   │   ├── codeEditor.tsx          # Monaco editor wrapper
│   │   └── prompt-input.tsx        # AI chat panel
│   └── WorkspaceShare.tsx          # Share management dialog
├── lib/
│   ├── parser.ts                   # DSL → nodes/edges parser
│   ├── layout.ts                   # ELK.js layout engine
│   ├── store.tsx                   # Zustand state management
│   ├── db.ts                       # Prisma client singleton
│   └── supabase.ts                 # Supabase client
├── hooks/
│   └── useWorkspaceSocket.ts       # Real-time collaboration hook
└── prisma/
    └── schema.prisma               # Database schema
```

---

## 🔑 Key Engineering Decisions

### Why a Custom DSL Instead of JSON?

Most AI-to-diagram tools generate raw JSON coordinates. We deliberately chose a human-readable DSL:

```
[Client App] -> [API Gateway]
[API Gateway] -> [Auth Service]
[Auth Service] -> [Data Layer]

[Client App] inside [Frontend Phase]
[API Gateway] inside [Routing Phase]
[Auth Service] inside [Processing Phase]
[Data Layer] inside [Storage Phase]
```

**Why**: Users can read, edit, and understand the architecture without touching the canvas. The DSL is the source of truth — the canvas is a derived view.

### Why ELK.js Over Manual Positioning?

LLMs produce arbitrary coordinates that create visual chaos. ELK.js applies the **Sugiyama/layered algorithm** to automatically:
- Minimize edge crossings
- Enforce hierarchical flow (top → bottom)
- Compute optimal node spacing within groups
- Handle orthogonal edge routing

Result: every generated diagram looks clean on the first render, without any manual adjustment.

### Why Supabase Realtime Over Socket.io/Pusher?

- **Zero backend infrastructure** — no WebSocket server to manage
- **Already using Supabase** for PostgreSQL — no additional service
- **Broadcast channels** are ephemeral (no persistence overhead for cursors)
- **Built-in presence** for future online-user indicators

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with obsessive attention to architecture by <a href="https://github.com/your-username">Aryan</a>
</p>
