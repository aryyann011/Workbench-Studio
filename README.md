<div align="center">

# 🎨 Workbench Studio

**Turn a sentence into a production-ready system architecture diagram — in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

*An AI-powered system design workspace that translates natural language into mathematically routed, interactive architecture diagrams.*

<p align="center">
  <em>Prompt → AI → Custom DSL → Graph Layout Engine → Interactive Canvas</em>
</p>

</div>

---

## ✨ Features

<table>
  <tr>
    <td><b>🤖 AI-Powered Compilation</b><br>Describe your system in plain English. Gemini 2.5 Flash acts as a translation layer, compiling your intent into our strict custom DSL.</td>
    <td><b>🎨 Interactive Canvas</b><br>Full ReactFlow integration. Drag-and-drop nodes, smooth zoom/pan with minimap navigation, and high-res 3x PNG exports.</td>
  </tr>
  <tr>
    <td><b>⚡ Auto-Layout Engine</b><br>No manual positioning required. ELK.js algorithmically computes optimal node placement and orthogonal edge routing instantly.</td>
    <td><b>👥 Real-Time Collaboration</b><br>Powered by Supabase Realtime. See live cursors, active node locks, and instant syncs as your team architectures together.</td>
  </tr>
  <tr>
    <td><b>✏️ Dual-Mode Editor</b><br>Toggle between Code View (Monaco Editor), Canvas View, or Split View. Hit Run to re-parse and re-layout at any time.</td>
    <td><b>🔐 Sharing & Access Control</b><br>Generate tokenized public share links or invite users directly via Clerk ID with strict Owner, Collaborator, or Reader permissions.</td>
  </tr>
  <tr>
    <td><b>⚡ Smart Prompt Caching</b><br>Two-tier cache (SHA-256 hash match → 70% character similarity). Includes "Create New" bypass and 30-day auto-eviction.</td>
    <td><b>↩️ Undo / Redo</b><br>Full action-based undo/redo stack supporting node deletion and movement — scoped per user in collaborative sessions.</td>
  </tr>
</table>

## 🏗️ Architecture

Workbench Studio utilizes a highly responsive client-side state machine synced over WebSockets to maintain real-time collaborative parity.

```mermaid
graph TD
    %% Styling
    classDef client fill:#1E293B,stroke:#334155,stroke-width:2px,color:#fff;
    classDef ai fill:#4285F4,stroke:#1A73E8,stroke-width:2px,color:#fff;
    classDef db fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef server fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#fff;

    %% Nodes
    Client[("💻 Browser<br>Monaco + ReactFlow")]:::client
    Store["📦 Zustand Store<br>(Nodes/Edges/Undo)"]:::client
    API["⚡ Next.js API<br>(/api/generate)"]:::server
    Actions["⚙️ Server Actions<br>(Prisma CRUD)"]:::server
    Gemini["🧠 Gemini 2.5 Flash"]:::ai
    DB[("🐘 PostgreSQL<br>(Supabase)")]:::db
    Socket(("📻 Supabase Realtime<br>(Cursors/Locks)")):::db

    %% Relationships
    Client <--> Store
    Client -- "1. Prompt Request" --> API
    API -- "2. Natural Language" --> Gemini
    Gemini -- "3. Custom DSL" --> API
    API -- "4. Parsed Nodes" --> Client
    Client -- "5. Persist Layout" --> Actions
    Actions --> DB
    Client <-->|"6. Broadcast Mutations"| Socket
```

### The Pipeline

```mermaid
flowchart LR
    classDef core fill:#2D3748,stroke:#4A5568,color:#fff;
    
    A([User Prompt]) --> B[Gemini 2.5]:::core
    B --> C[DSL Code]:::core
    C --> D[Regex Parser]:::core
    D --> E[ELK.js Layout]:::core
    E --> F([ReactFlow Render])
```

1. **Input** — User describes a system in the AI chat or writes DSL code directly.
2. **Cache Check** — SHA-256 hash lookup → similarity scan of recent prompts.
3. **AI Generation** — Gemini produces DSL syntax: `[Node] -> [Node]` connections + `[Node] inside [Phase]` groupings.
4. **Parsing** — Custom regex-based parser extracts nodes, edges, and parent-child relationships.
5. **Layout** — ELK.js (layered algorithm) computes optimal positions minimizing edge crossings.
6. **Render** — ReactFlow renders the interactive diagram with dynamic icons, handles, and styling.
7. **Persist** — Auto-saved to PostgreSQL every 2 seconds (debounced).
8. **Broadcast** — All mutations sync to collaborators via Supabase Realtime.

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

## 🔑 Key Engineering Decisions

<details>
<summary><b>Click to expand: Why a Custom DSL instead of JSON?</b></summary>
<br>
Most AI-to-diagram tools generate raw JSON coordinates. We deliberately engineered a human-readable DSL:

```text
[Client App] -> [API Gateway]
[API Gateway] -> [Auth Service]
[Auth Service] -> [Data Layer]

[Client App] inside [Frontend Phase]
[API Gateway] inside [Routing Phase]
[Auth Service] inside [Processing Phase]
[Data Layer] inside [Storage Phase]
```
**Why:** Users can read, edit, and understand the architecture without touching the canvas. The DSL is the source of truth — the canvas is a derived view.
</details>

<details>
<summary><b>Click to expand: Why ELK.js Over Manual Positioning?</b></summary>
<br>
LLMs produce arbitrary coordinates that create visual chaos. ELK.js applies the **Sugiyama/layered algorithm** to automatically:
- Minimize edge crossings
- Enforce hierarchical flow (top → bottom)
- Compute optimal node spacing within groups
- Handle orthogonal edge routing

Result: every generated diagram looks clean on the first render, without any manual adjustment.
</details>

<details>
<summary><b>Click to expand: Why Supabase Realtime Over Socket.io/Pusher?</b></summary>
<br>

- **Zero backend infrastructure** — no WebSocket server to manage
- **Already using Supabase** for PostgreSQL — no additional service
- **Broadcast channels** are ephemeral (no persistence overhead for cursors)
- **Built-in presence** for future online-user indicators
</details>

## 📦 Database Schema

```mermaid
erDiagram
    WORKSPACE ||--o{ WORKSPACE_SHARE : manages
    WORKSPACE {
        string id PK
        string userId
        string name
        text code
        jsonb canvas_nodes
        jsonb canvas_edges
        datetime createdAt
        datetime updatedAt
    }
    WORKSPACE_SHARE {
        string id PK
        string workspaceId FK
        string userId
        string shareToken
        enum role "OWNER | COLLABORATOR | READER"
        string createdBy
        datetime expiresAt
    }
    PROMPT_CACHE {
        string id PK
        string userId
        string promptText
        string promptHash "SHA-256 unique"
        text generatedCode
        jsonb canvas_nodes
        jsonb canvas_edges
        int usageCount
        datetime lastUsed
        datetime createdAt
    }
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase free tier)
- Clerk account (free tier)
- Google AI Studio API key (Gemini access)

### 1. Clone & Install
```bash
git clone [https://github.com/your-username/workbench-studio.git](https://github.com/your-username/workbench-studio.git)
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
NEXT_PUBLIC_SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
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

## 📁 Project Structure

```text
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
│   └── promptCache.ts              # Cache operations server actions
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

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Architected and engineered by Aryan Mishra.*
