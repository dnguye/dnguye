-- Agentic Workspace — one-click demo workspace seeding
-- Exposed as an RPC: supabase.rpc('seed_demo_workspace')
-- Runs as security definer but always seeds for the *calling* user (auth.uid()).

create or replace function public.seed_demo_workspace()
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  uid uuid := auth.uid();
  ws uuid;
  ws_slug text;
  a_atlas uuid; a_scribe uuid; a_janitor uuid;
  s_brief uuid; s_research uuid; s_plan uuid; s_report uuid; s_clean uuid;
  r_brief uuid; r_digest uuid; r_clean uuid;
  run1 uuid; run2 uuid; run3 uuid; run4 uuid; run5 uuid; run6 uuid;
  art1 uuid; art2 uuid; art3 uuid; art4 uuid;
  n_hub uuid; n_router uuid; n_proj_launch uuid; n_proj_ops uuid;
  n_atlas uuid; n_scribe uuid; n_brief uuid; n_research uuid; n_plan uuid;
  n_art uuid; n_ref uuid; n_cal uuid; n_notion uuid;
begin
  if uid is null then
    raise exception 'seed_demo_workspace requires an authenticated user';
  end if;

  ws_slug := 'demo-' || substr(md5(gen_random_uuid()::text), 1, 6);

  insert into workspaces (name, slug, owner_id, settings)
  values ('Aurora Labs (Demo)', ws_slug, uid, '{"demo": true}'::jsonb)
  returning id into ws;

  -- -------------------------------------------------------------------------
  -- Agents
  -- -------------------------------------------------------------------------
  insert into agents (workspace_id, name, description, avatar, status, provider, model,
                      default_effort, system_prompt, enabled_tools, permissions, tags)
  values
    (ws, 'Atlas', 'Research generalist. Gathers sources, verifies claims, and produces grounded summaries with citations.',
     '🧭', 'active', 'simulated', 'simulated-large', 'high',
     'You are Atlas, a meticulous research agent. Always cite sources, flag uncertainty, and prefer primary documents.',
     array['web_search', 'read_files', 'write_artifacts'],
     '{"can_write_external": false, "allowed_connections": []}'::jsonb,
     array['research', 'analysis']),
    (ws, 'Scribe', 'Writing and reporting specialist. Turns raw findings into polished briefs, plans, and branded reports.',
     '✍️', 'active', 'simulated', 'simulated-large', 'medium',
     'You are Scribe, a precise writing agent. Write in clear prose, structure documents with headings, and keep executive summaries under 150 words.',
     array['read_files', 'write_artifacts', 'send_email'],
     '{"can_write_external": true, "allowed_connections": ["gmail", "notion"]}'::jsonb,
     array['writing', 'reports']),
    (ws, 'Custodian', 'Workspace operations agent. Organizes files, dedupes artifacts, and keeps the library tidy.',
     '🧹', 'paused', 'simulated', 'simulated-small', 'low',
     'You are Custodian, a careful operations agent. Never delete without an approved plan; propose changes before applying them.',
     array['read_files', 'organize_files'],
     '{"can_write_external": false, "allowed_connections": []}'::jsonb,
     array['ops', 'files']);

  select id into a_atlas from agents where workspace_id = ws and name = 'Atlas';
  select id into a_scribe from agents where workspace_id = ws and name = 'Scribe';
  select id into a_janitor from agents where workspace_id = ws and name = 'Custodian';

  -- -------------------------------------------------------------------------
  -- Skills
  -- -------------------------------------------------------------------------
  insert into skills (workspace_id, name, slug, description, category, tags,
                      instructions_markdown, input_schema, output_schema,
                      default_agent_id, version, version_notes, is_active, created_by)
  values
    (ws, 'Daily workspace briefing', 'daily-briefing',
     'Summarize what changed in the workspace: runs, artifacts, failures, and what needs attention today.',
     'operations', array['daily', 'summary'],
     $md$# Daily workspace briefing

Produce a short morning briefing for the workspace.

## Steps
1. Collect runs and artifacts from the last 24 hours.
2. Highlight failures and anything waiting for approval.
3. List today's scheduled routines with their expected outputs.
4. Close with one suggested focus for the day.

## Constraints
- Keep it under 300 words.
- Use bullet points, not tables.
$md$,
     '{"type": "object", "properties": {"focus_hint": {"type": "string", "description": "Optional focus area for today"}}}'::jsonb,
     '{"type": "object", "properties": {"summary_markdown": {"type": "string"}, "attention_items": {"type": "array", "items": {"type": "string"}}}, "required": ["summary_markdown"]}'::jsonb,
     a_atlas, 3, 'v3: added attention_items to output schema.', true, uid),
    (ws, 'Research and summarize', 'research-summarize',
     'Deep-dive a topic, gather sources, and produce a structured summary with citations and open questions.',
     'research', array['research', 'web'],
     $md$# Research and summarize

Research the given topic and produce a grounded summary.

## Steps
1. Break the topic into 3-5 sub-questions.
2. Gather at least 5 credible sources per sub-question.
3. Synthesize findings; separate facts from interpretation.
4. End with open questions and suggested next steps.

## Constraints
- Every claim needs a source.
- Flag low-confidence findings explicitly.
$md$,
     '{"type": "object", "properties": {"topic": {"type": "string"}, "depth": {"type": "string", "enum": ["quick", "standard", "deep"]}}, "required": ["topic"]}'::jsonb,
     '{"type": "object", "properties": {"summary_markdown": {"type": "string"}, "sources": {"type": "array", "items": {"type": "string"}}}, "required": ["summary_markdown"]}'::jsonb,
     a_atlas, 2, 'v2: enforce per-claim citations.', true, uid),
    (ws, 'Create a project plan', 'project-plan',
     'Turn a goal into a phased project plan with milestones, owners, risks, and a first-week schedule.',
     'planning', array['planning', 'projects'],
     $md$# Create a project plan

Turn the stated goal into an actionable plan.

## Steps
1. Clarify the goal, constraints, and definition of done.
2. Propose 3-5 phases with milestones and rough dates.
3. Identify risks and mitigations.
4. Produce a first-week day-by-day schedule.
$md$,
     '{"type": "object", "properties": {"goal": {"type": "string"}, "deadline": {"type": "string", "format": "date"}}, "required": ["goal"]}'::jsonb,
     '{"type": "object", "properties": {"plan_markdown": {"type": "string"}, "milestones": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "date": {"type": "string"}}}}}, "required": ["plan_markdown"]}'::jsonb,
     a_scribe, 1, 'Initial version.', true, uid),
    (ws, 'Generate a branded report', 'branded-report',
     'Format findings into a polished HTML report using the workspace brand template.',
     'writing', array['reports', 'html'],
     $md$# Generate a branded report

Turn input findings into a polished, branded HTML report.

## Steps
1. Read the findings payload.
2. Apply the report template from the references panel.
3. Produce a single self-contained HTML artifact.

## Constraints
- Inline all CSS; no external assets.
- Include a generated-on date in the footer.
$md$,
     '{"type": "object", "properties": {"title": {"type": "string"}, "findings_markdown": {"type": "string"}}, "required": ["title", "findings_markdown"]}'::jsonb,
     '{"type": "object", "properties": {"artifact_id": {"type": "string"}}}'::jsonb,
     a_scribe, 1, 'Initial version.', true, uid),
    (ws, 'Clean and organize workspace files', 'clean-organize',
     'Audit the artifact library, propose a cleanup plan (dedupe, retag, archive), and apply it after approval.',
     'operations', array['ops', 'files'],
     $md$# Clean and organize workspace files

Audit the artifact library and tidy it up.

## Steps
1. Scan artifacts for duplicates, missing tags, and stale drafts.
2. Propose a cleanup plan as a structured diff.
3. WAIT for human approval — this skill performs write actions.
4. Apply the approved plan and report what changed.

## Constraints
- Never delete originals; archive instead.
- All write actions require approval.
$md$,
     '{"type": "object", "properties": {"dry_run": {"type": "boolean", "default": true}}}'::jsonb,
     '{"type": "object", "properties": {"actions_applied": {"type": "array", "items": {"type": "string"}}}}'::jsonb,
     a_janitor, 1, 'Initial version.', true, uid);

  select id into s_brief from skills where workspace_id = ws and slug = 'daily-briefing';
  select id into s_research from skills where workspace_id = ws and slug = 'research-summarize';
  select id into s_plan from skills where workspace_id = ws and slug = 'project-plan';
  select id into s_report from skills where workspace_id = ws and slug = 'branded-report';
  select id into s_clean from skills where workspace_id = ws and slug = 'clean-organize';

  insert into skill_references (skill_id, name, type, url, content_summary)
  values
    (s_report, 'Brand report template', 'html', null,
     'Self-contained HTML template with the Aurora Labs palette, header band, and footer.'),
    (s_report, 'Voice and tone guide', 'markdown', null,
     'Short guide: plain language, active voice, executive summary first.'),
    (s_research, 'Source quality rubric', 'markdown', null,
     'How to rank sources: primary > peer-reviewed > reputable press > blogs.'),
    (s_brief, 'Briefing example', 'markdown', null,
     'A model briefing from a previous week, kept as a gold standard.'),
    (s_clean, 'Retention policy', 'pdf', null,
     'Which artifact types must be retained and for how long.');

  -- -------------------------------------------------------------------------
  -- Routines
  -- -------------------------------------------------------------------------
  insert into routines (workspace_id, name, description, schedule_cron, timezone,
                        agent_id, skill_id, input, enabled, last_run_at, next_run_at,
                        delivery_target, approval_policy)
  values
    (ws, 'Morning briefing', 'Daily workspace briefing delivered before standup.',
     '0 8 * * 1-5', 'UTC', a_atlas, s_brief, '{}'::jsonb, true,
     now() - interval '22 hours', date_trunc('day', now()) + interval '1 day 8 hours',
     '{"type": "artifact_library"}'::jsonb, 'auto'),
    (ws, 'Weekly research digest', 'Friday digest of everything researched this week.',
     '0 16 * * 5', 'UTC', a_atlas, s_research,
     '{"topic": "This week''s open research threads", "depth": "standard"}'::jsonb, true,
     now() - interval '3 days', date_trunc('week', now()) + interval '4 days 16 hours',
     '{"type": "artifact_library"}'::jsonb, 'auto'),
    (ws, 'Library cleanup', 'Weekly artifact-library cleanup pass (requires approval).',
     '0 7 * * 1', 'UTC', a_janitor, s_clean, '{"dry_run": false}'::jsonb, false,
     now() - interval '9 days', null,
     '{"type": "artifact_library"}'::jsonb, 'require_approval');

  select id into r_brief from routines where workspace_id = ws and name = 'Morning briefing';
  select id into r_digest from routines where workspace_id = ws and name = 'Weekly research digest';
  select id into r_clean from routines where workspace_id = ws and name = 'Library cleanup';

  -- -------------------------------------------------------------------------
  -- Runs (history with mixed outcomes)
  -- -------------------------------------------------------------------------
  insert into runs (workspace_id, agent_id, skill_id, routine_id, status, input, output,
                    progress, model, effort, cost_estimate, error_message, created_by,
                    created_at, started_at, finished_at)
  values
    (ws, a_atlas, s_brief, r_brief, 'succeeded', '{}'::jsonb,
     '{"summary_markdown": "All quiet. 3 artifacts generated yesterday; no failures.", "attention_items": []}'::jsonb,
     '[{"step": "Collecting activity", "at": "-22h"}, {"step": "Drafting briefing", "at": "-22h"}, {"step": "Done", "at": "-22h"}]'::jsonb,
     'simulated-large', 'high', 0.0412, null, uid,
     now() - interval '22 hours', now() - interval '22 hours', now() - interval '22 hours' + interval '38 seconds'),
    (ws, a_atlas, s_research, r_digest, 'succeeded',
     '{"topic": "Vector databases for personal knowledge management", "depth": "deep"}'::jsonb,
     '{"summary_markdown": "Compared 6 options across recall, latency and cost...", "sources": ["arxiv:2401.001", "pgvector docs"]}'::jsonb,
     '[{"step": "Planning sub-questions"}, {"step": "Gathering sources"}, {"step": "Synthesizing"}, {"step": "Done"}]'::jsonb,
     'simulated-large', 'high', 0.1873, null, uid,
     now() - interval '3 days', now() - interval '3 days', now() - interval '3 days' + interval '4 minutes'),
    (ws, a_scribe, s_plan, null, 'succeeded',
     '{"goal": "Launch the Q4 partner portal", "deadline": "2026-11-15"}'::jsonb,
     '{"plan_markdown": "## Phase 1 — Discovery...", "milestones": [{"name": "Beta", "date": "2026-10-20"}]}'::jsonb,
     '[{"step": "Clarifying goal"}, {"step": "Drafting phases"}, {"step": "Done"}]'::jsonb,
     'simulated-large', 'medium', 0.0951, null, uid,
     now() - interval '2 days', now() - interval '2 days', now() - interval '2 days' + interval '2 minutes'),
    (ws, a_atlas, s_brief, r_brief, 'failed', '{}'::jsonb, null,
     '[{"step": "Collecting activity"}, {"step": "Error: activity feed timed out"}]'::jsonb,
     'simulated-large', 'high', 0.0089, 'Upstream timeout while reading the activity feed (simulated).', uid,
     now() - interval '46 hours', now() - interval '46 hours', now() - interval '46 hours' + interval '61 seconds'),
    (ws, a_janitor, s_clean, r_clean, 'needs_approval', '{"dry_run": false}'::jsonb, null,
     '[{"step": "Scanning library"}, {"step": "Proposing cleanup plan"}, {"step": "Waiting for approval"}]'::jsonb,
     'simulated-small', 'low', 0.0035, null, uid,
     now() - interval '5 hours', now() - interval '5 hours', null),
    (ws, a_scribe, s_report, null, 'running',
     '{"title": "Q3 retro report", "findings_markdown": "..."}'::jsonb, null,
     '[{"step": "Reading findings"}, {"step": "Applying template"}]'::jsonb,
     'simulated-large', 'medium', null, null, uid,
     now() - interval '3 minutes', now() - interval '3 minutes', null);

  select id into run1 from runs where workspace_id = ws and skill_id = s_brief and status = 'succeeded' limit 1;
  select id into run2 from runs where workspace_id = ws and skill_id = s_research and status = 'succeeded' limit 1;
  select id into run3 from runs where workspace_id = ws and skill_id = s_plan and status = 'succeeded' limit 1;
  select id into run5 from runs where workspace_id = ws and status = 'needs_approval' limit 1;

  -- Attach the proposed write action to the approval-pending run
  update runs set proposed_action = jsonb_build_object(
    'kind', 'write',
    'title', 'Apply library cleanup plan',
    'destination', 'artifact_library',
    'summary', 'Archive 4 stale drafts, merge 2 duplicate reports, retag 11 artifacts.',
    'payload', jsonb_build_object(
      'archive', jsonb_build_array('draft-brief-0812', 'draft-brief-0813', 'untitled-2', 'untitled-3'),
      'merge', jsonb_build_array(jsonb_build_object('keep', 'q3-retro-final', 'remove', 'q3-retro-final-copy')),
      'retag', jsonb_build_object('count', 11, 'tag', 'archive-2026')
    )
  )
  where id = run5;

  -- -------------------------------------------------------------------------
  -- Artifacts
  -- -------------------------------------------------------------------------
  insert into artifacts (workspace_id, run_id, title, type, mime_type, content_inline,
                         metadata, searchable_text, tags, created_by, created_at)
  values
    (ws, run1, 'Morning briefing — yesterday', 'markdown', 'text/markdown',
     $md$# Morning briefing

**All quiet.** 3 artifacts generated yesterday; no failures.

- Research digest draft is ready for review.
- No routines waiting on approval.
- Suggested focus: finish the Q4 partner portal plan.
$md$,
     '{"generator": "Atlas"}'::jsonb,
     'morning briefing quiet artifacts research digest partner portal', array['briefing'], uid,
     now() - interval '22 hours'),
    (ws, run2, 'Research: vector databases for PKM', 'report', 'text/markdown',
     $md$# Vector databases for personal knowledge management

## Summary
Compared 6 options across recall, latency, cost and operational burden.
pgvector wins for this workspace: no extra infra, good-enough recall at our scale.

## Findings
1. Sub-100k embeddings: exact search is fine; ANN adds complexity without benefit.
2. pgvector + HNSW covers up to ~5M vectors comfortably.
3. Dedicated stores only pay off with multi-tenant, high-QPS workloads.

## Open questions
- Embedding refresh cadence for edited notes?
$md$,
     '{"generator": "Atlas", "sources": 12}'::jsonb,
     'vector databases pgvector embeddings knowledge management research', array['research'], uid,
     now() - interval '3 days'),
    (ws, run3, 'Q4 partner portal — project plan', 'markdown', 'text/markdown',
     $md$# Q4 partner portal — project plan

## Phase 1 — Discovery (2 weeks)
Interviews with 5 partners; requirements doc.

## Phase 2 — Build (5 weeks)
Auth, portal shell, document sharing.

## Phase 3 — Beta (2 weeks)
Milestone: Beta on 2026-10-20 with 3 partners.

## Risks
- SSO integration timelines are partner-dependent.
$md$,
     '{"generator": "Scribe"}'::jsonb,
     'project plan partner portal phases milestones beta', array['plan', 'q4'], uid,
     now() - interval '2 days'),
    (ws, null, 'Run metrics export', 'csv', 'text/csv',
     'date,runs,succeeded,failed,cost_usd' || E'\n' ||
     '2026-08-18,14,13,1,0.92' || E'\n' ||
     '2026-08-19,11,11,0,0.71' || E'\n' ||
     '2026-08-20,16,15,1,1.13',
     '{"generator": "system"}'::jsonb,
     'run metrics export csv cost', array['metrics'], uid,
     now() - interval '1 day');

  select id into art1 from artifacts where workspace_id = ws and title like 'Morning briefing%' limit 1;
  select id into art2 from artifacts where workspace_id = ws and title like 'Research: vector%' limit 1;

  -- -------------------------------------------------------------------------
  -- Connections
  -- -------------------------------------------------------------------------
  insert into connections (workspace_id, provider, display_name, status, scopes,
                           encrypted_credentials_reference, allowed_agent_ids, last_sync_at, metadata)
  values
    (ws, 'google_calendar', 'Google Calendar', 'connected',
     array['calendar.readonly'], 'vault:demo/google_calendar', array[a_atlas], now() - interval '12 minutes',
     '{"calendars": 2}'::jsonb),
    (ws, 'gmail', 'Gmail', 'attention',
     array['gmail.readonly', 'gmail.send'], 'vault:demo/gmail', array[a_scribe], now() - interval '2 days',
     '{"note": "Token expiring soon — reauthorize"}'::jsonb),
    (ws, 'notion', 'Notion', 'connected',
     array['read_content', 'insert_content'], 'vault:demo/notion', array[a_scribe], now() - interval '1 hour',
     '{"pages": 148}'::jsonb),
    (ws, 'slack', 'Slack', 'disconnected',
     array[]::text[], null, array[]::uuid[], null, '{}'::jsonb),
    (ws, 'supabase', 'Supabase (this project)', 'connected',
     array['db.read'], 'vault:demo/supabase', array[a_atlas, a_janitor], now() - interval '5 minutes',
     '{}'::jsonb),
    (ws, 'mcp', 'Generic MCP server', 'disconnected',
     array[]::text[], null, array[]::uuid[], null,
     '{"endpoint": ""}'::jsonb);

  -- -------------------------------------------------------------------------
  -- Knowledge graph (hub-and-spoke with a router document)
  -- -------------------------------------------------------------------------
  insert into knowledge_nodes (workspace_id, title, type, summary, content_markdown, entity_id, position)
  values
    (ws, 'Aurora Labs', 'workspace', 'Workspace hub — everything hangs off this node.', null, ws,
     '{"x": 0, "y": 0}'::jsonb),
    (ws, 'Agent router', 'router',
     'Router document: tells agents where projects, skills and constraints live.',
     $md$# Agent router — Aurora Labs

Start here before any task.

## Projects
- **Q4 partner portal** → use the *Create a project plan* skill; constraints in the project node.
- **Research ops** → use *Research and summarize*; apply the source quality rubric.

## Skills
- Daily briefings: `daily-briefing` (Atlas)
- Reports: `branded-report` (Scribe) — always use the brand template reference.

## Constraints
- External writes (email, Notion) always require human approval.
- Prefer artifacts over ad-hoc messages for anything worth keeping.
$md$,
     null, '{"x": 0, "y": -220}'::jsonb),
    (ws, 'Q4 partner portal', 'project', 'Portal for partner document sharing; beta in October.', null, null,
     '{"x": -340, "y": -120}'::jsonb),
    (ws, 'Research ops', 'project', 'Ongoing research threads and digests.', null, null,
     '{"x": 340, "y": -120}'::jsonb),
    (ws, 'Atlas', 'agent', 'Research generalist agent.', null, a_atlas, '{"x": 340, "y": 120}'::jsonb),
    (ws, 'Scribe', 'agent', 'Writing and reporting agent.', null, a_scribe, '{"x": -340, "y": 120}'::jsonb),
    (ws, 'Daily workspace briefing', 'skill', 'Morning summary skill.', null, s_brief, '{"x": 120, "y": 240}'::jsonb),
    (ws, 'Research and summarize', 'skill', 'Deep research skill.', null, s_research, '{"x": 480, "y": 240}'::jsonb),
    (ws, 'Create a project plan', 'skill', 'Planning skill.', null, s_plan, '{"x": -480, "y": 240}'::jsonb),
    (ws, 'Vector DB research report', 'artifact', 'Latest deep-research output.', null, art2, '{"x": 560, "y": 0}'::jsonb),
    (ws, 'Source quality rubric', 'reference', 'How to rank sources.', null, null, '{"x": 560, "y": -240}'::jsonb),
    (ws, 'Google Calendar', 'connection', 'Read-only calendar access.', null, null, '{"x": -120, "y": 240}'::jsonb),
    (ws, 'Notion', 'connection', 'Docs workspace, write requires approval.', null, null, '{"x": -560, "y": 0}'::jsonb);

  select id into n_hub from knowledge_nodes where workspace_id = ws and type = 'workspace';
  select id into n_router from knowledge_nodes where workspace_id = ws and type = 'router';
  select id into n_proj_launch from knowledge_nodes where workspace_id = ws and title = 'Q4 partner portal';
  select id into n_proj_ops from knowledge_nodes where workspace_id = ws and title = 'Research ops';
  select id into n_atlas from knowledge_nodes where workspace_id = ws and title = 'Atlas';
  select id into n_scribe from knowledge_nodes where workspace_id = ws and title = 'Scribe';
  select id into n_brief from knowledge_nodes where workspace_id = ws and title = 'Daily workspace briefing';
  select id into n_research from knowledge_nodes where workspace_id = ws and title = 'Research and summarize';
  select id into n_plan from knowledge_nodes where workspace_id = ws and title = 'Create a project plan';
  select id into n_art from knowledge_nodes where workspace_id = ws and title = 'Vector DB research report';
  select id into n_ref from knowledge_nodes where workspace_id = ws and title = 'Source quality rubric';
  select id into n_cal from knowledge_nodes where workspace_id = ws and title = 'Google Calendar';
  select id into n_notion from knowledge_nodes where workspace_id = ws and title = 'Notion';

  insert into knowledge_edges (workspace_id, source_node_id, target_node_id, relation_type)
  values
    (ws, n_hub, n_router, 'routed_by'),
    (ws, n_hub, n_proj_launch, 'contains'),
    (ws, n_hub, n_proj_ops, 'contains'),
    (ws, n_router, n_proj_launch, 'routes_to'),
    (ws, n_router, n_proj_ops, 'routes_to'),
    (ws, n_proj_launch, n_scribe, 'assigned_to'),
    (ws, n_proj_ops, n_atlas, 'assigned_to'),
    (ws, n_atlas, n_brief, 'uses_skill'),
    (ws, n_atlas, n_research, 'uses_skill'),
    (ws, n_scribe, n_plan, 'uses_skill'),
    (ws, n_research, n_art, 'produced'),
    (ws, n_research, n_ref, 'guided_by'),
    (ws, n_atlas, n_cal, 'reads_from'),
    (ws, n_scribe, n_notion, 'writes_to');

  -- -------------------------------------------------------------------------
  -- Audit trail
  -- -------------------------------------------------------------------------
  insert into audit_events (workspace_id, actor_id, actor_type, event_type, entity_type, entity_id, payload, created_at)
  values
    (ws, uid, 'user', 'workspace.created', 'workspace', ws, jsonb_build_object('name', 'Aurora Labs (Demo)'), now() - interval '3 days'),
    (ws, uid, 'user', 'agent.created', 'agent', a_atlas, jsonb_build_object('name', 'Atlas'), now() - interval '3 days'),
    (ws, uid, 'user', 'skill.updated', 'skill', s_brief, jsonb_build_object('version', 3), now() - interval '2 days'),
    (ws, null, 'agent', 'run.succeeded', 'run', run2, jsonb_build_object('skill', 'research-summarize', 'cost', 0.1873), now() - interval '3 days'),
    (ws, null, 'agent', 'run.failed', 'run', null, jsonb_build_object('skill', 'daily-briefing', 'error', 'Upstream timeout'), now() - interval '46 hours'),
    (ws, null, 'agent', 'run.needs_approval', 'run', run5, jsonb_build_object('skill', 'clean-organize', 'action', 'Apply library cleanup plan'), now() - interval '5 hours'),
    (ws, uid, 'user', 'connection.connected', 'connection', null, jsonb_build_object('provider', 'notion'), now() - interval '1 day'),
    (ws, null, 'system', 'connection.attention', 'connection', null, jsonb_build_object('provider', 'gmail', 'reason', 'token expiring'), now() - interval '6 hours');

  return jsonb_build_object('workspace_id', ws, 'slug', ws_slug);
end;
$fn$;

revoke all on function public.seed_demo_workspace() from public;
grant execute on function public.seed_demo_workspace() to authenticated;
