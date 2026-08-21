import { z } from "zod";

export const effortSchema = z.enum(["low", "medium", "high", "max"]);

export const jsonObjectSchema = z
  .string()
  .transform((value, ctx) => {
    if (!value.trim()) return {};
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        ctx.addIssue({ code: "custom", message: "Must be a JSON object" });
        return z.NEVER;
      }
      return parsed as Record<string, unknown>;
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      return z.NEVER;
    }
  });

export const workspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Lowercase letters, numbers, dashes"),
});

export const agentSchema = z.object({
  name: z.string().min(2, "Name is required").max(60),
  description: z.string().max(500).default(""),
  avatar: z.string().max(8).default("🤖"),
  status: z.enum(["active", "paused", "archived"]).default("active"),
  provider: z.string().default("simulated"),
  model: z.string().min(1).default("simulated-large"),
  default_effort: effortSchema.default("medium"),
  system_prompt: z.string().max(20000).default(""),
  enabled_tools: z.array(z.string()).default([]),
  permissions: z
    .object({
      can_write_external: z.boolean().default(false),
      allowed_connections: z.array(z.string()).default([]),
    })
    .default({ can_write_external: false, allowed_connections: [] }),
  tags: z.array(z.string()).default([]),
});
export type AgentFormValues = z.infer<typeof agentSchema>;

export const skillSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Lowercase letters, numbers, dashes"),
  description: z.string().max(500).default(""),
  category: z.string().min(1).default("general"),
  tags: z.array(z.string()).default([]),
  instructions_markdown: z.string().max(50000).default(""),
  input_schema: z.record(z.string(), z.unknown()).default({}),
  output_schema: z.record(z.string(), z.unknown()).default({}),
  default_agent_id: z.string().uuid().nullable().default(null),
  is_active: z.boolean().default(true),
  version_notes: z.string().max(2000).default(""),
});
export type SkillFormValues = z.infer<typeof skillSchema>;

export const cronSchema = z
  .string()
  .regex(
    /^\s*\S+\s+\S+\s+\S+\s+\S+\s+\S+\s*$/,
    "Use a 5-field cron expression (minute hour day month weekday)"
  );

export const routineSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  description: z.string().max(500).default(""),
  schedule_cron: cronSchema,
  timezone: z.string().min(1).default("UTC"),
  agent_id: z.string().uuid({ message: "Pick an agent" }),
  skill_id: z.string().uuid({ message: "Pick a skill" }),
  input: z.record(z.string(), z.unknown()).default({}),
  enabled: z.boolean().default(true),
  delivery_target: z
    .object({
      type: z.enum(["artifact_library", "email", "slack", "notion", "webhook"]),
      address: z.string().optional(),
    })
    .default({ type: "artifact_library" }),
  approval_policy: z.enum(["auto", "require_approval"]).default("auto"),
});
export type RoutineFormValues = z.infer<typeof routineSchema>;

export const executeRunSchema = z.object({
  workspace_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  skill_id: z.string().uuid().nullable().optional(),
  routine_id: z.string().uuid().nullable().optional(),
  input: z.record(z.string(), z.unknown()).default({}),
  model: z.string().optional(),
  effort: effortSchema.optional(),
});
export type ExecuteRunInput = z.infer<typeof executeRunSchema>;

export const connectionSchema = z.object({
  provider: z.enum(["google_calendar", "gmail", "notion", "slack", "supabase", "mcp"]),
  display_name: z.string().min(2).max(80),
  scopes: z.array(z.string()).default([]),
  allowed_agent_ids: z.array(z.string().uuid()).default([]),
});
export type ConnectionFormValues = z.infer<typeof connectionSchema>;

export const knowledgeNodeSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum([
    "workspace",
    "project",
    "agent",
    "skill",
    "routine",
    "reference",
    "artifact",
    "connection",
    "router",
    "note",
  ]),
  summary: z.string().max(500).default(""),
  source_url: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  content_markdown: z.string().max(50000).nullable().default(null),
});
export type KnowledgeNodeFormValues = z.infer<typeof knowledgeNodeSchema>;
