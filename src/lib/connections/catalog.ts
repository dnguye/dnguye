/**
 * Client-safe connection catalog: display metadata only. Anything secret
 * (client ids, tokens, signing keys) lives in server env vars and the
 * server-side adapters in adapters.ts.
 */

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  defaultScopes: string[];
  /** lucide icon name used by the UI */
  icon: "calendar" | "mail" | "book" | "message-square" | "database" | "plug";
  docsUrl?: string;
}

export const PROVIDER_CATALOG: ProviderInfo[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Let agents read your schedule for briefings and planning.",
    defaultScopes: ["calendar.readonly"],
    icon: "calendar",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read and (with approval) send email through your account.",
    defaultScopes: ["gmail.readonly", "gmail.send"],
    icon: "mail",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read pages and publish reports to your docs workspace.",
    defaultScopes: ["read_content", "insert_content"],
    icon: "book",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Deliver briefings and run results to channels.",
    defaultScopes: ["chat:write", "channels:read"],
    icon: "message-square",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Query a Supabase project's database from skills.",
    defaultScopes: ["db.read"],
    icon: "database",
  },
  {
    id: "mcp",
    name: "MCP server",
    description: "Connect a generic Model Context Protocol server for custom tools.",
    defaultScopes: [],
    icon: "plug",
  },
];

export function providerInfo(id: string): ProviderInfo {
  return (
    PROVIDER_CATALOG.find((p) => p.id === id) ?? {
      id,
      name: id,
      description: "Custom provider",
      defaultScopes: [],
      icon: "plug",
    }
  );
}
