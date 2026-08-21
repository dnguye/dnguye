-- Agentic Workspace — Row Level Security
-- Every table is locked down so users can only touch data in workspaces
-- where they hold a membership row. Viewers are read-only.

-- ---------------------------------------------------------------------------
-- Helper functions (security definer avoids RLS recursion on workspace_members)
-- ---------------------------------------------------------------------------

create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create or replace function public.workspace_role_of(ws uuid)
returns public.workspace_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.workspace_members
  where workspace_id = ws and user_id = auth.uid();
$$;

-- member or better (can create/update content)
create or replace function public.can_edit_workspace(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.workspace_role_of(ws) in ('owner', 'admin', 'member');
$$;

-- admin or better (can manage members, delete shared config)
create or replace function public.can_admin_workspace(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.workspace_role_of(ws) in ('owner', 'admin');
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles are readable by any authenticated user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------

alter table public.workspaces enable row level security;

create policy "members can read their workspaces"
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

create policy "users can create workspaces they own"
  on public.workspaces for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "admins can update workspaces"
  on public.workspaces for update
  to authenticated
  using (public.can_admin_workspace(id))
  with check (public.can_admin_workspace(id));

create policy "owners can delete workspaces"
  on public.workspaces for delete
  to authenticated
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- workspace_members
-- ---------------------------------------------------------------------------

alter table public.workspace_members enable row level security;

create policy "members can see membership of their workspaces"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can add members"
  on public.workspace_members for insert
  to authenticated
  with check (public.can_admin_workspace(workspace_id));

create policy "admins can change member roles"
  on public.workspace_members for update
  to authenticated
  using (public.can_admin_workspace(workspace_id))
  with check (public.can_admin_workspace(workspace_id));

create policy "admins can remove members, users can leave"
  on public.workspace_members for delete
  to authenticated
  using (public.can_admin_workspace(workspace_id) or user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Content tables: agents, skills, routines, runs, artifacts,
-- knowledge_nodes, knowledge_edges, connections
-- Pattern: members read; member+ writes; admin deletes where destructive.
-- ---------------------------------------------------------------------------

alter table public.agents enable row level security;
create policy "members read agents" on public.agents for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "editors insert agents" on public.agents for insert
  to authenticated with check (public.can_edit_workspace(workspace_id));
create policy "editors update agents" on public.agents for update
  to authenticated using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));
create policy "editors delete agents" on public.agents for delete
  to authenticated using (public.can_edit_workspace(workspace_id));

alter table public.skills enable row level security;
create policy "members read skills" on public.skills for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "editors insert skills" on public.skills for insert
  to authenticated with check (public.can_edit_workspace(workspace_id));
create policy "editors update skills" on public.skills for update
  to authenticated using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));
create policy "editors delete skills" on public.skills for delete
  to authenticated using (public.can_edit_workspace(workspace_id));

alter table public.skill_references enable row level security;
create policy "members read skill references" on public.skill_references for select
  to authenticated using (
    exists (
      select 1 from public.skills s
      where s.id = skill_id and public.is_workspace_member(s.workspace_id)
    )
  );
create policy "editors write skill references" on public.skill_references for insert
  to authenticated with check (
    exists (
      select 1 from public.skills s
      where s.id = skill_id and public.can_edit_workspace(s.workspace_id)
    )
  );
create policy "editors update skill references" on public.skill_references for update
  to authenticated using (
    exists (
      select 1 from public.skills s
      where s.id = skill_id and public.can_edit_workspace(s.workspace_id)
    )
  );
create policy "editors delete skill references" on public.skill_references for delete
  to authenticated using (
    exists (
      select 1 from public.skills s
      where s.id = skill_id and public.can_edit_workspace(s.workspace_id)
    )
  );

alter table public.routines enable row level security;
create policy "members read routines" on public.routines for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "editors insert routines" on public.routines for insert
  to authenticated with check (public.can_edit_workspace(workspace_id));
create policy "editors update routines" on public.routines for update
  to authenticated using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));
create policy "editors delete routines" on public.routines for delete
  to authenticated using (public.can_edit_workspace(workspace_id));

alter table public.runs enable row level security;
create policy "members read runs" on public.runs for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "editors insert runs" on public.runs for insert
  to authenticated with check (public.can_edit_workspace(workspace_id));
create policy "editors update runs" on public.runs for update
  to authenticated using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));
-- Runs are audit history: no client-side deletes.

alter table public.artifacts enable row level security;
create policy "members read artifacts" on public.artifacts for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "editors insert artifacts" on public.artifacts for insert
  to authenticated with check (public.can_edit_workspace(workspace_id));
create policy "editors update artifacts" on public.artifacts for update
  to authenticated using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));
create policy "editors delete artifacts" on public.artifacts for delete
  to authenticated using (public.can_edit_workspace(workspace_id));

alter table public.knowledge_nodes enable row level security;
create policy "members read knowledge nodes" on public.knowledge_nodes for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "editors insert knowledge nodes" on public.knowledge_nodes for insert
  to authenticated with check (public.can_edit_workspace(workspace_id));
create policy "editors update knowledge nodes" on public.knowledge_nodes for update
  to authenticated using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));
create policy "editors delete knowledge nodes" on public.knowledge_nodes for delete
  to authenticated using (public.can_edit_workspace(workspace_id));

alter table public.knowledge_edges enable row level security;
create policy "members read knowledge edges" on public.knowledge_edges for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "editors insert knowledge edges" on public.knowledge_edges for insert
  to authenticated with check (public.can_edit_workspace(workspace_id));
create policy "editors update knowledge edges" on public.knowledge_edges for update
  to authenticated using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));
create policy "editors delete knowledge edges" on public.knowledge_edges for delete
  to authenticated using (public.can_edit_workspace(workspace_id));

alter table public.connections enable row level security;
create policy "members read connections" on public.connections for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "admins insert connections" on public.connections for insert
  to authenticated with check (public.can_admin_workspace(workspace_id));
create policy "admins update connections" on public.connections for update
  to authenticated using (public.can_admin_workspace(workspace_id))
  with check (public.can_admin_workspace(workspace_id));
create policy "admins delete connections" on public.connections for delete
  to authenticated using (public.can_admin_workspace(workspace_id));

-- ---------------------------------------------------------------------------
-- audit_events: append-only for members; immutable afterwards
-- ---------------------------------------------------------------------------

alter table public.audit_events enable row level security;
create policy "members read audit events" on public.audit_events for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "members append audit events" on public.audit_events for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
-- No update/delete policies: audit log is immutable from the client.

-- ---------------------------------------------------------------------------
-- dashboard_layouts: strictly per-user
-- ---------------------------------------------------------------------------

alter table public.dashboard_layouts enable row level security;
create policy "users read own layouts" on public.dashboard_layouts for select
  to authenticated using (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "users insert own layouts" on public.dashboard_layouts for insert
  to authenticated with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "users update own layouts" on public.dashboard_layouts for update
  to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "users delete own layouts" on public.dashboard_layouts for delete
  to authenticated using (user_id = auth.uid());
