// Domain types mirroring the Supabase schema (supabase/migrations/00001_schema.sql).
// If you change the schema, update these types (or generate them with
// `supabase gen types typescript` and adapt).

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type AgentStatus = "active" | "paused" | "archived";
export type RunStatus =
  | "queued"
  | "running"
  | "needs_approval"
  | "succeeded"
  | "failed"
  | "cancelled";
export type ApprovalPolicy = "auto" | "require_approval";
export type ConnectionStatus = "connected" | "attention" | "disconnected";
export type ReferenceType =
  | "markdown"
  | "pdf"
  | "html"
  | "json"
  | "image"
  | "code"
  | "url";
export type EffortLevel = "low" | "medium" | "high" | "max";
export type ArtifactType =
  | "report"
  | "markdown"
  | "html"
  | "json"
  | "image"
  | "csv"
  | "pdf"
  | "other";
export type KnowledgeNodeType =
  | "workspace"
  | "project"
  | "agent"
  | "skill"
  | "routine"
  | "reference"
  | "artifact"
  | "connection"
  | "router"
  | "note";

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json | undefined };

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  settings: Record<string, Json>;
  created_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profile?: Profile | null;
}

export interface AgentPermissions {
  can_write_external: boolean;
  allowed_connections: string[];
  [key: string]: Json | undefined;
}

export interface Agent {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  avatar: string | null;
  status: AgentStatus;
  provider: string;
  model: string;
  default_effort: EffortLevel;
  system_prompt: string;
  enabled_tools: string[];
  permissions: AgentPermissions;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  instructions_markdown: string;
  input_schema: Record<string, Json>;
  output_schema: Record<string, Json>;
  default_agent_id: string | null;
  version: number;
  version_notes: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillReference {
  id: string;
  skill_id: string;
  name: string;
  type: ReferenceType;
  storage_path: string | null;
  url: string | null;
  content_summary: string;
  created_at: string;
}

export interface DeliveryTarget {
  type: "artifact_library" | "email" | "slack" | "notion" | "webhook";
  address?: string;
  [key: string]: Json | undefined;
}

export interface Routine {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  schedule_cron: string;
  timezone: string;
  agent_id: string | null;
  skill_id: string | null;
  input: Record<string, Json>;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  delivery_target: DeliveryTarget;
  approval_policy: ApprovalPolicy;
  created_at: string;
  updated_at: string;
}

export interface ProposedAction {
  kind: "write" | "read";
  title: string;
  destination: string;
  summary: string;
  payload: Json;
}

export interface RunProgressStep {
  step: string;
  at?: string;
  detail?: string;
}

export interface Run {
  id: string;
  workspace_id: string;
  agent_id: string | null;
  skill_id: string | null;
  routine_id: string | null;
  status: RunStatus;
  input: Record<string, Json>;
  output: Record<string, Json> | null;
  proposed_action: ProposedAction | null;
  approved_by: string | null;
  approved_at: string | null;
  progress: RunProgressStep[];
  model: string | null;
  effort: string | null;
  cost_estimate: number | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  // joined
  agent?: Pick<Agent, "id" | "name" | "avatar"> | null;
  skill?: Pick<Skill, "id" | "name" | "slug"> | null;
}

export interface Artifact {
  id: string;
  workspace_id: string;
  run_id: string | null;
  title: string;
  type: ArtifactType;
  mime_type: string;
  storage_path: string | null;
  preview_url: string | null;
  content_inline: string | null;
  metadata: Record<string, Json>;
  searchable_text: string;
  tags: string[];
  created_by: string | null;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  workspace_id: string;
  title: string;
  type: KnowledgeNodeType;
  summary: string;
  source_url: string | null;
  storage_path: string | null;
  content_markdown: string | null;
  entity_id: string | null;
  position: { x?: number; y?: number };
  metadata: Record<string, Json>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEdge {
  id: string;
  workspace_id: string;
  source_node_id: string;
  target_node_id: string;
  relation_type: string;
  created_at: string;
}

export interface Connection {
  id: string;
  workspace_id: string;
  provider: string;
  display_name: string;
  status: ConnectionStatus;
  scopes: string[];
  encrypted_credentials_reference: string | null;
  allowed_agent_ids: string[];
  last_sync_at: string | null;
  metadata: Record<string, Json>;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  actor_type: "user" | "agent" | "system";
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  payload: Record<string, Json>;
  created_at: string;
}

export interface DashboardLayoutItem {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
}

export const EFFORT_LEVELS: EffortLevel[] = ["low", "medium", "high", "max"];

export const SIMULATED_MODELS = [
  { id: "simulated-large", label: "Simulated Large" },
  { id: "simulated-small", label: "Simulated Small" },
] as const;
