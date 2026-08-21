/** Centralized TanStack Query keys, always scoped by workspace id. */
export const queryKeys = {
  workspaces: ["workspaces"] as const,
  members: (ws: string) => ["workspaces", ws, "members"] as const,
  agents: (ws: string) => ["workspaces", ws, "agents"] as const,
  agent: (ws: string, id: string) => ["workspaces", ws, "agents", id] as const,
  skills: (ws: string) => ["workspaces", ws, "skills"] as const,
  skill: (ws: string, id: string) => ["workspaces", ws, "skills", id] as const,
  skillReferences: (skillId: string) => ["skill-references", skillId] as const,
  skillRunStats: (ws: string) => ["workspaces", ws, "skill-run-stats"] as const,
  routines: (ws: string) => ["workspaces", ws, "routines"] as const,
  runs: (ws: string, filters?: Record<string, unknown>) =>
    ["workspaces", ws, "runs", filters ?? {}] as const,
  run: (ws: string, id: string) => ["workspaces", ws, "runs", "detail", id] as const,
  artifacts: (ws: string, filters?: Record<string, unknown>) =>
    ["workspaces", ws, "artifacts", filters ?? {}] as const,
  artifact: (ws: string, id: string) =>
    ["workspaces", ws, "artifacts", "detail", id] as const,
  knowledge: (ws: string) => ["workspaces", ws, "knowledge"] as const,
  connections: (ws: string) => ["workspaces", ws, "connections"] as const,
  audit: (ws: string) => ["workspaces", ws, "audit"] as const,
  dashboardLayout: (ws: string) => ["workspaces", ws, "dashboard-layout"] as const,
};
