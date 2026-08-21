# Agentic Workspace

A personal and team **command center for AI agents** — manage agents, reusable
skills, scheduled automations, connected tools, a knowledge graph, and every
artifact your agents produce. Built with Next.js (App Router), Supabase, and a
calm, dark-first "operating system" UI.

## Features

- **Dashboard** — a widget grid you can drag and resize (layout persisted per
  user per workspace): attention needed, upcoming routines, recent artifacts,
  skills deck, agent status, connected apps, and an audit-friendly activity
  feed. `Cmd/Ctrl+K` opens a command palette; **Quick Run** launches any skill
  with structured inputs.
- **Agents** — directory + detail pages (Overview, Skills, Runs, Memory,
  Settings) with model configuration, system prompt, permitted tools, and a
  permission profile. A simulated execution engine streams progress states,
  produces mock artifacts, and is designed to be swapped for real providers.
- **Skills** — a versioned catalog with a full editor: markdown instructions,
  input/output JSON schemas, references/files, a test-run panel, and version
  notes. Five example skills ship with the demo seed.
- **Routines** — cron-scheduled agent work with timezone support, input
  payloads, delivery targets, run policies, history, retry, and
  enable/disable. Executed **server-side** so no browser session is needed.
- **Artifact library** — searchable, filterable grid/list with previews
  (markdown, HTML, JSON, CSV, images, PDF), provenance back to the source run
  and skill, and uploads via Supabase Storage.
- **Knowledge graph** — an interactive React Flow "second brain" of projects,
  agents, skills, references, artifacts, and connections, including **router
  documents** that point agents at the right context. Read-only navigator on
  mobile.
- **Connections** — placeholder integrations (Google Calendar, Gmail, Notion,
  Slack, Supabase, generic MCP) with a server-side adapter interface and OAuth
  stubs. Tokens never reach the client.
- **Runs, approvals, audit** — full run log (status, timing, cost, IO,
  errors, artifacts). Any **write** action parks in `needs_approval` and shows
  the exact proposed payload; nothing external executes without explicit human
  confirmation. Everything lands in an immutable audit table.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 + shadcn-style
components · Supabase (Auth, Postgres + RLS, Storage, Realtime) ·
TanStack Query · React Flow (@xyflow/react) · Zod · Lucide · Netlify.

## Local setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com) (or run
   `supabase start` for a local stack).
2. Apply the migrations in order — either via the SQL editor or the CLI:

   ```bash
   supabase link --project-ref <your-ref>
   supabase db push          # applies supabase/migrations/*.sql
   ```

   The migrations create every table, index, enum, storage bucket, all RLS
   policies, and the `seed_demo_workspace()` RPC.
3. In **Auth → Providers**, enable Email. For local development you may want
   to disable email confirmations so sign-up is instant.

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | routine scheduler job |
| `CRON_SECRET` | **server only** | protects `/api/jobs/execute-routine` |

Never prefix secrets with `NEXT_PUBLIC_`.

### 4. Run

```bash
npm run dev
```

Sign up, then click **Seed demo workspace** to provision agents, skills,
routines, run history, artifacts, connections, and a sample knowledge graph
(it calls the `seed_demo_workspace()` RPC — also available from Settings).

## Architecture

```
src/
  app/                      # routes (App Router)
    api/runs/execute        # queue + run a simulated agent execution
    api/runs/[id]/approve   # human approval gate for write actions
    api/runs/[id]/cancel
    api/jobs/execute-routine# scheduler entry point (server-side, no user session)
    api/connections/authorize
    w/[slug]/…              # workspace pages (dashboard, agents, skills, …)
  components/               # UI (shadcn-style primitives + feature components)
  lib/
    supabase/               # browser / server / service-role clients
    queries/                # TanStack Query data-access hooks (all RLS-scoped)
    runner/                 # run engine + ProviderAdapter interface + simulated adapter
    scheduler/              # scheduler adapter seam (database-polling default)
    connections/            # connection catalog + server-side OAuth adapter stubs
    schemas.ts              # zod validation for forms and API payloads
    types.ts                # domain types mirroring the database schema
supabase/migrations/        # schema, RLS, storage, demo-seed RPC
netlify/functions/          # scheduled function that ticks the routine scheduler
```

The layers are deliberately separated: **UI → queries → database** for reads
and simple writes, and **UI → API routes → runner engine → provider adapter**
for anything that executes work, needs approval, or touches secrets.

### Security model

- **RLS everywhere**: every table requires workspace membership; viewers are
  read-only, members can edit content, admins manage members/connections, and
  the audit table is append-only from clients.
- **Approvals**: adapters signal write actions via `needs_approval`; the
  `/approve` route records the approving user and only then resumes
  execution. Agents can never perform external writes autonomously.
- **Secrets**: provider tokens are represented by opaque
  `encrypted_credentials_reference` values pointing at a server-side secret
  store; real tokens must never be written to client-readable tables.

## Routine scheduling (server-side)

Routines fire independently of any browser via
`POST /api/jobs/execute-routine` guarded by `CRON_SECRET`:

```bash
curl -X POST https://<site>/api/jobs/execute-routine \
     -H "Authorization: Bearer $CRON_SECRET"
```

The endpoint (using the service-role key) picks up routines with
`enabled = true AND next_run_at <= now()`, creates runs, executes them, and
recomputes `next_run_at` from the cron expression + timezone.

Any ticker works:

- **Netlify Scheduled Functions** — included: `netlify/functions/routine-tick.mjs`
  runs every 5 minutes. Set `CRON_SECRET` in the site env.
- GitHub Actions cron, Supabase `pg_cron` + `pg_net`, cron-job.org, etc.
- Push-based schedulers (Inngest, Trigger.dev, QStash): implement the
  `SchedulerAdapter` interface in `src/lib/scheduler/` and call it from the
  routine mutations.

## Replacing the simulated runner with a real provider

The runner is provider-agnostic. To integrate a real model provider:

1. Implement `ProviderAdapter` (see `src/lib/runner/types.ts`; the reference
   implementation is `simulated.ts`). Your adapter receives the agent config
   (model, system prompt, tools), the skill (instructions + schemas), and the
   input; it emits progress steps and returns output/artifacts — or a
   `needs_approval` result for any external write.
2. Register it in `src/lib/runner/registry.ts` under a provider id.
3. Set `provider` on your agents to that id.
4. Keep API keys in server env vars — adapters run only inside API routes.

The engine (`src/lib/runner/engine.ts`) keeps persistence, realtime progress,
approvals, artifacts, and audit logging identical for every provider. For
long-running real executions, move `executeRun` from the request lifecycle
into a queue/worker (the engine only needs a Supabase client and a run id).

## Deploying to Netlify

1. Push this repo to GitHub and "Import from Git" in Netlify — the
   `@netlify/plugin-nextjs` runtime is configured in `netlify.toml`.
2. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `CRON_SECRET`.
3. The scheduled function `routine-tick` deploys automatically and starts
   ticking the scheduler every 5 minutes.
4. Add your Netlify URL to Supabase **Auth → URL configuration** (site URL +
   redirect URLs).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint |
