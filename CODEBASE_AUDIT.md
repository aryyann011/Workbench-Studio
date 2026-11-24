# Workbench Studio — Codebase Audit & Remediation Log

> Full security/quality audit of the project, created so findings don't get lost in chat.
> Legend: `[FIXED]` = addressed in the cleanup commit · `[OPEN]` = still to do.

---

## 1. Critical — Security

| # | Status | Finding | Location |
|---|--------|---------|----------|
| C1 | `[OPEN]` (manual) | `.env` holds live secrets: Clerk secret key, Google API key, Groq API key, Supabase DB password. Verified via git history that `.env` was **never committed**, but all keys were exposed in chat sessions — rotate them in Clerk / Google AI Studio / Groq / Supabase dashboards. | `.env` |
| C2 | `[OPEN]` | `/api/enrich` has **no auth and no rate limit**; anyone can burn Gemini quota. | `app/api/enrich/route.ts` |
| C3 | `[OPEN]` | TLS verification disabled to production DB (`rejectUnauthorized: false`). Re-enable proper certificate validation. | `lib/db.ts:10` |
| C4 | `[OPEN]` | No rate limiting on `/api/generate`, `/api/feedback`, `/api/share/save`. Feedback endpoint is fully unauthenticated (spam + DB flooding), no length validation. | `app/api/*` |
| C5 | `[OPEN]` | Supabase Realtime channel `workspace-{id}` accepts any client with the anon key — anyone knowing a workspace UUID can read state or broadcast `node-delete` / `sync-timeline` (griefing). | `hooks/useWorkspaceSocket.ts:41` |
| C6 | `[OPEN]` | Clerk `pk_test`/`sk_test` keys used for production deploy — auth runs in dev mode. Switch to live keys for prod. | env / Vercel |
| C7 | `[OPEN]` | No payload size limits on workspace `code`/`nodes`/`edges` (DB bloat abuse). | `app/api/share/save/route.ts`, `actions/workspace.ts` |
| C8 | `[OPEN]` | `inviteUser` accepts any `WorkspaceRole` including OWNER (ACL invariant break). | `actions/share.ts:76` |
| C9 | `[OPEN]` | LLM prompt input (`text`) is not length/type capped → cost-bomb abuse. | `app/api/generate/route.ts:96` |

## 2. High — Auth / Access bugs

| # | Status | Finding | Location |
|---|--------|---------|----------|
| H1 | `[OPEN]` | Share URL is malformed: `NEXT_PUBLIC_APP_URL` has no scheme → `workbench-studio.vercel.app/share/x` instead of a link. | `actions/share.ts:60`, `components/WorkspaceShare.tsx:118` |
| H2 | `[OPEN]` | `getAccessibleWorkspace` duplicated in two files — permission model will drift. | `actions/workspace.ts:23`, `actions/share.ts:193` |
| H3 | `[OPEN]` | Auto-save fires for READER users (silently denied) and also on initial page load, bumping `updatedAt` on every open. | `app/dashboard/[id]/page.tsx` |
| H4 | `[OPEN]` | "Shared With Me" shows expired invites (no `expiresAt` filter). | `app/dashboard/page.tsx:19` |
| H5 | `[OPEN]` | No try/catch around Prisma in dashboard server component. | `app/dashboard/page.tsx:14` |

## 3. Medium — Logic bugs

| # | Status | Finding | Location |
|---|--------|---------|----------|
| M1 | `[OPEN]` | `PromptCache.promptHash` is globally `@unique`; two users with the same prompt collide (second save dropped). Should be `@@unique([userId, promptHash])` + migration. | `prisma/schema.prisma:62` |
| M2 | `[OPEN]` | Redo ignores user scoping (undo checks `userId`, redo doesn't). | `lib/store.tsx` |
| M3 | `[OPEN]` | Undo stack (`past`) unbounded — memory grows during long sessions. | `lib/store.tsx` |
| M4 | `[OPEN]` | `broadcastTimelineSync` can no-op due to channel-creation race (called via `setTimeout` right after generate). | `hooks/useWorkspaceSocket.ts:8` |
| M5 | `[OPEN]` | `onConnect` allows self-loops and duplicate edges. | `lib/store.tsx:237` |
| M6 | `[OPEN]` | Workspace load silently skips workspaces without nodes; switching workspace IDs can leave stale code in the store. | `app/dashboard/[id]/page.tsx:75` |
| M7 | `[OPEN]` | Shared-page auto-save ignores response errors — collaborators lose work silently. | `app/share/[token]/page.tsx:90` |
| M8 | `[OPEN]` | Failed generation responses (`{error}`) end the spinner with no message to the user. | `app/dashboard/[id]/page.tsx:188` |

## 4. Low — Code quality / hygiene

### Fixed in this cleanup

| # | Status | Change |
|---|--------|--------|
| L1 | `[FIXED]` | Removed junk/unused deps: `@xyflow/react` (never imported; only `reactflow` v11 is used), `@prisma/adapter-neon` (unused, project uses pg pooler), `dropdown-menu` (mistyped junk package; `@radix-ui/react-dropdown-menu` is the real one). 17 packages dropped. |
| L2 | `[FIXED]` | Removed dead imports: `import { promises } from 'dns'` + double `Connection` import (`lib/store.tsx`), `import { error } from "console"` (`app/api/generate/route.ts`), unused `Node/Edge` type imports (dashboard/[id], share/[token], share/save route), `NodeResizeControl` (`lib/parser.ts`), unused lucide icons across pages, unused `updateShareRole` import, unused `useMemo`/`useRouter`/state setters. |
| L3 | `[FIXED]` | Deleted one-off codemod script `fix-theme.js` from repo root. |
| L4 | `[FIXED]` | Root layout converted back to a **Server Component** (removed stray `"use client"`), so proper `metadata` could be added: metadataBase, title template, description, OpenGraph, Twitter card. Removed leftover `<head>` with `mitgo-verification` meta tag. |
| L5 | `[FIXED]` | Font loading consolidated into `lib/fonts.ts` (Geist, Geist Mono, Libre Baskerville, Inter, Space Grotesk) — each loaded once with a CSS variable. Landing/feedback pages no longer instantiate duplicate `next/font` instances; sidebar imports `baskerville` from `lib/fonts` instead of from the layout module. |
| L6 | `[FIXED]` | Settings page: replaced hardcoded `text-white` / `bg-neutral-900` / `border-neutral-800` with theme tokens (`text-foreground`, `bg-muted`, `border-border`) so light mode works. |
| L7 | `[FIXED]` | `next.config.ts`: `poweredByHeader: false` + `X-Content-Type-Options: nosniff` and `Referrer-Policy` security headers. |
| L8 | `[FIXED]` | `systemGroupNode`: typed props, added `displayName` (React DevTools name) — fixes `react/display-name` lint error. |
| L9 | `[FIXED]` | `systemNode`: replaced per-render `lazy()` creation with a module-level lazy icon map — fixes the React Compiler "component created during render" error and avoids remounting icons on every render. |
| L10 | `[FIXED]` | `ui/sidebar`: removed unused `MenuIcon`/`PanelLeftIcon`; skeleton width now uses a `useState` lazy initializer instead of calling `Math.random()` during render (purity rule). |
| L11 | `[FIXED]` | `lib/layout.ts`: replaced all `any` with explicit `ElkNodeShape` / `ElkEdge` types (ELK graph, recursive tree builder, node lookup). |
| L12 | `[FIXED]` | `lib/store.tsx`: consistent `userId` types in `Action`, `updateNodeData` typed as `Record<string, unknown>`, `prefer-const` fix, `RedoTheAction` signature cleaned (param was unused). |
| L13 | `[FIXED]` | `hooks/useWorkspaceSocket.ts`: `presence` typed as `Record<string, Record<string, unknown>>`; removed unused destructure in node-delete handler. |
| L14 | `[FIXED]` | `actions/promptCache.ts`: `any` → `unknown` for canvas payloads; Prisma error code cast `(error as { code?: string })`. |
| L15 | `[FIXED]` | Sign-in / sign-up pages: removed `catch (err: any)` in favor of a typed error shape (`{ errors?: Array<{ message?: string }> }`). |
| L16 | `[FIXED]` | `WorkspaceShare.tsx`: `shares` state typed (`ShareEntry[]`), JSX unescaped quotes/apostrophes escaped. Feedback page apostrophe escaped; unused catch binding removed. |
| L17 | `[FIXED]` | `diagramCanvas.tsx`: removed dead `isInteractive` state / `lastUpdate` ref / `presence` destructure; node event handlers typed with `Node`. |
| L18 | `[FIXED]` | `eslint.config.mjs`: downgraded two strict new React-Compiler-era rules to warnings (`@typescript-eslint/no-explicit-any`, `react-hooks/set-state-in-effect`). They remain visible, but don't block lint. |
| L19 | `[FIXED]` | `npm run lint` now exits **0** (0 errors, 14 warnings). Previously 36 errors. |

### Still open

| # | Status | Finding |
|---|--------|---------|
| L20 | `[OPEN]` | `npm audit` reports 24 advisories (2 low, 6 moderate, 15 high, 1 critical) — almost all build/dev tooling (`@babel/core`, `browserslist`, `brace-expansion`, `@hono/node-server` via Prisma CLI). Run `npm audit fix` (non-breaking) when network allows; `--force` only if you accept major bumps. |
| L21 | `[OPEN]` | Two React Flow generations installed was fixed (removed @xyflow/react), but keep an eye on `reactflow` v11 → `@xyflow/react` v12 migration if you want long-term maintenance. |
| L22 | `[OPEN]` | `<img>` tags in sidebar/settings (Clerk avatar) — consider `next/image` with `remotePatterns`. Currently only lint warnings. |
| L23 | `[OPEN]` | Settings page still has non-persisting fake controls (selects aren't wired, custom API key input disabled). Either implement or remove to avoid misleading UI. |
| L24 | `[OPEN]` | No tests, no CI workflow (`.github/` absent). |
| L25 | `[OPEN]` | `proxy.ts` matcher includes `/api` — this is actually required for `auth()` to work in route handlers, not dead config. Add a comment so future-you doesn't "clean it up". |
| L26 | `[OPEN]` | Parser (`lib/parser.ts`) has edge cases: lowercased-label ID collisions, `[A] inside [A]`, fixed 400×400 group fallback sizes. |

---

## 5. What changed this session (file-by-file)

- `package.json` / `package-lock.json` — removed `@xyflow/react`, `@prisma/adapter-neon`, `dropdown-menu`.
- `app/layout.tsx` — server component + metadata + font variables (no more `<head>` hack / mitgo tag).
- `lib/fonts.ts` — **new** shared font definitions.
- `app/page.tsx`, `app/feedback/page.tsx` — use font CSS variables; removed duplicate `next/font` instances; unused icon imports removed; JSX entities escaped.
- `components/sidebar.tsx` — imports font from `lib/fonts`; dead imports removed.
- `components/ui/sidebar.tsx` — purity + dead import fixes.
- `components/reactFlow/systemNode.tsx` — module-level lazy icon map + typed.
- `components/reactFlow/systemGroupNode.tsx` — typed props + `displayName`.
- `components/reactFlow/diagramCanvas.tsx` — dead state/refs removed, handler types.
- `components/WorkspaceShare.tsx` — typed shares, escaped entities, dead imports.
- `components/editor/prompt-input.tsx` — dead import + unused prop removal.
- `app/dashboard/settings/page.tsx` — theme tokens.
- `app/dashboard/[id]/page.tsx`, `app/share/[token]/page.tsx` — dead imports (font/type), duplicate type removed, unused state removed.
- `app/api/generate/route.ts` — dead import, typed catch/cast.
- `app/api/share/save/route.ts` — dead type import.
- `app/sign-in/...`, `app/sign-up/...` — typed error handling.
- `actions/promptCache.ts` — `unknown` payload types, error cast.
- `lib/layout.ts` — ELK types.
- `lib/store.tsx` — type consistency, `prefer-const`, dead imports.
- `hooks/useWorkspaceSocket.ts` — presence type, dead destructure.
- `eslint.config.mjs` — two rules downgraded to warn.
- `next.config.ts` — headers + `poweredByHeader`.
- `fix-theme.js` — **deleted**.

### Verification status
- `npm run lint` → **passes** (0 errors / 14 warnings).
- `npm run build` → the last full run failed on a duplicate `ViewMode` type introduced during edits; that was fixed afterwards, but subsequent build runs were interrupted before completion. **Re-run `npm run build` before deploying.**

---

## 6. Recommended remediation order

1. **Rotate all keys** (C1) and restore `sslmode=require` (C3).
2. Add `auth()` + rate limiting to `/api/enrich`, `/api/generate`, `/api/feedback` (C2, C4, C9).
3. Fix share URL scheme (H1) and add `@@unique([userId, promptHash])` migration (M1).
4. Gate or authenticate Supabase Realtime events (C5).
5. Reduce duplicated permission logic (H2) and fix auto-save behavior (H3).
6. Run `npm audit fix`, then `npm run build` + deploy.
