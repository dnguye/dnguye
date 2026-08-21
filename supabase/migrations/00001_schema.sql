-- Agentic Workspace — core schema
-- Tables, enums, indexes, and triggers. RLS policies live in 00002_rls.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.workspace_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.agent_status as enum ('active', 'paused', 'archived');
create type public.run_status as enum (
  'queued', 'running', 'needs_approval', 'succeeded', 'failed', 'cancelled'
);
create type public.routine_approval_policy as enum ('auto', 'require_approval');
create type public.connection_status as enum ('connected', 'attention', 'disconnected');
create type public.reference_type as enum ('markdown', 'pdf', 'html', 'json', 'image', 'code', 'url');

-- ---------------------------------------------------------------------------
-- Profiles (mirror of auth.users, safe to expose to workspace members)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Workspaces + membership
-- ---------------------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  owner_id uuid not null references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_idx on public.workspace_members (user_id);

-- The creating user automatically becomes the owner member.
create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- ---------------------------------------------------------------------------
-- Agents
-- ---------------------------------------------------------------------------

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  description text not null default '',
  avatar text,                          -- emoji or storage path
  status public.agent_status not null default 'active',
  provider text not null default 'simulated',
  model text not null default 'simulated-large',
  default_effort text not null default 'medium'
    check (default_effort in ('low', 'medium', 'high', 'max')),
  system_prompt text not null default '',
  enabled_tools text[] not null default '{}',
  permissions jsonb not null default '{"can_write_external": false, "allowed_connections": []}'::jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agents_workspace_idx on public.agents (workspace_id);
create index agents_tags_idx on public.agents using gin (tags);

-- ---------------------------------------------------------------------------
-- Skills + references
-- ---------------------------------------------------------------------------

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  category text not null default 'general',
  tags text[] not null default '{}',
  instructions_markdown text not null default '',
  input_schema jsonb not null default '{"type": "object", "properties": {}}'::jsonb,
  output_schema jsonb not null default '{"type": "object", "properties": {}}'::jsonb,
  default_agent_id uuid references public.agents (id) on delete set null,
  version integer not null default 1,
  version_notes text not null default '',
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create index skills_workspace_idx on public.skills (workspace_id);
create index skills_tags_idx on public.skills using gin (tags);

create table public.skill_references (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills (id) on delete cascade,
  name text not null,
  type public.reference_type not null default 'markdown',
  storage_path text,
  url text,
  content_summary text not null default '',
  created_at timestamptz not null default now()
);

create index skill_references_skill_idx on public.skill_references (skill_id);

-- ---------------------------------------------------------------------------
-- Routines
-- ---------------------------------------------------------------------------

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  description text not null default '',
  schedule_cron text not null default '0 9 * * 1-5',
  timezone text not null default 'UTC',
  agent_id uuid references public.agents (id) on delete set null,
  skill_id uuid references public.skills (id) on delete set null,
  input jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  delivery_target jsonb not null default '{"type": "artifact_library"}'::jsonb,
  approval_policy public.routine_approval_policy not null default 'auto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index routines_workspace_idx on public.routines (workspace_id);
create index routines_due_idx on public.routines (next_run_at) where enabled;

-- ---------------------------------------------------------------------------
-- Runs
-- ---------------------------------------------------------------------------

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  skill_id uuid references public.skills (id) on delete set null,
  routine_id uuid references public.routines (id) on delete set null,
  status public.run_status not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  proposed_action jsonb,                -- populated when status = needs_approval
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  progress jsonb not null default '[]'::jsonb,   -- streamed step log
  model text,
  effort text,
  cost_estimate numeric(10, 4),
  error_message text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index runs_workspace_created_idx on public.runs (workspace_id, created_at desc);
create index runs_agent_idx on public.runs (agent_id);
create index runs_skill_idx on public.runs (skill_id);
create index runs_routine_idx on public.runs (routine_id);
create index runs_status_idx on public.runs (workspace_id, status);

-- ---------------------------------------------------------------------------
-- Artifacts
-- ---------------------------------------------------------------------------

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  run_id uuid references public.runs (id) on delete set null,
  title text not null,
  type text not null default 'report'
    check (type in ('report', 'markdown', 'html', 'json', 'image', 'csv', 'pdf', 'other')),
  mime_type text not null default 'text/markdown',
  storage_path text,
  preview_url text,
  content_inline text,                  -- small artifacts can live inline
  metadata jsonb not null default '{}'::jsonb,
  searchable_text text not null default '',
  tags text[] not null default '{}',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index artifacts_workspace_created_idx on public.artifacts (workspace_id, created_at desc);
create index artifacts_run_idx on public.artifacts (run_id);
create index artifacts_search_idx on public.artifacts
  using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(searchable_text, '')));

-- ---------------------------------------------------------------------------
-- Knowledge graph
-- ---------------------------------------------------------------------------

create table public.knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  type text not null default 'note'
    check (type in ('workspace', 'project', 'agent', 'skill', 'routine', 'reference',
                    'artifact', 'connection', 'router', 'note')),
  summary text not null default '',
  source_url text,
  storage_path text,
  content_markdown text,                -- router documents and notes
  entity_id uuid,                       -- optional link to the concrete entity row
  position jsonb not null default '{}'::jsonb,  -- persisted graph layout {x, y}
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_nodes_workspace_idx on public.knowledge_nodes (workspace_id);

create table public.knowledge_edges (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  source_node_id uuid not null references public.knowledge_nodes (id) on delete cascade,
  target_node_id uuid not null references public.knowledge_nodes (id) on delete cascade,
  relation_type text not null default 'related_to',
  created_at timestamptz not null default now()
);

create index knowledge_edges_workspace_idx on public.knowledge_edges (workspace_id);
create index knowledge_edges_source_idx on public.knowledge_edges (source_node_id);
create index knowledge_edges_target_idx on public.knowledge_edges (target_node_id);

-- ---------------------------------------------------------------------------
-- Connections
-- ---------------------------------------------------------------------------

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  provider text not null,               -- google_calendar | gmail | notion | slack | supabase | mcp
  display_name text not null,
  status public.connection_status not null default 'disconnected',
  scopes text[] not null default '{}',
  -- Opaque reference into the server-side secret store (e.g. Vault key).
  -- Actual tokens are NEVER stored in this table and never reach the client.
  encrypted_credentials_reference text,
  allowed_agent_ids uuid[] not null default '{}',
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index connections_workspace_idx on public.connections (workspace_id);

-- ---------------------------------------------------------------------------
-- Audit events
-- ---------------------------------------------------------------------------

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user', 'agent', 'system')),
  event_type text not null,             -- e.g. run.started, skill.updated, approval.granted
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_workspace_created_idx on public.audit_events (workspace_id, created_at desc);
create index audit_events_entity_idx on public.audit_events (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Per-user dashboard layouts
-- ---------------------------------------------------------------------------

create table public.dashboard_layouts (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  layout jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_agents_updated_at before update on public.agents
  for each row execute function public.set_updated_at();
create trigger set_skills_updated_at before update on public.skills
  for each row execute function public.set_updated_at();
create trigger set_routines_updated_at before update on public.routines
  for each row execute function public.set_updated_at();
create trigger set_connections_updated_at before update on public.connections
  for each row execute function public.set_updated_at();
create trigger set_knowledge_nodes_updated_at before update on public.knowledge_nodes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.runs;
alter publication supabase_realtime add table public.audit_events;
