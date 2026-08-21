/**
 * Server-side connection adapter interface.
 *
 * Each provider implements this contract. The app ships OAuth *stubs*: they
 * model the full flow (authorize → callback → store credential reference →
 * sync) without any fake production credentials. To go live with a provider:
 *
 *   1. Register an OAuth app with the provider and set the env vars the
 *      adapter documents (e.g. GOOGLE_OAUTH_CLIENT_ID/SECRET).
 *   2. Implement `getAuthorizeUrl` to return the real consent URL and
 *      `handleCallback` to exchange the code for tokens.
 *   3. Store tokens in a server-side secret store (Supabase Vault, your KMS)
 *      and save only an opaque reference in
 *      `connections.encrypted_credentials_reference`.
 *
 * Tokens must NEVER be written to any client-readable table or response.
 */

export interface AuthorizeResult {
  /** Real flow: URL to redirect the user to. Stub flow: null. */
  authorizeUrl: string | null;
  /** Stub flow marks the connection connected immediately. */
  simulated: boolean;
  credentialsReference: string | null;
}

export interface ConnectionAdapter {
  provider: string;
  /** True when real OAuth env vars are configured for this provider. */
  isConfigured(): boolean;
  getAuthorizeUrl(params: { workspaceId: string; connectionId: string }): AuthorizeResult;
  /** Pull fresh data / verify credentials; returns a status for the row. */
  sync(): Promise<{ status: "connected" | "attention"; note?: string }>;
}

function stubAdapter(provider: string, envHint: string[]): ConnectionAdapter {
  return {
    provider,
    isConfigured: () => envHint.every((name) => Boolean(process.env[name])),
    getAuthorizeUrl({ workspaceId }) {
      if (this.isConfigured()) {
        // Real implementation goes here: build the provider consent URL with
        // state=<workspaceId:connectionId> and redirect_uri to
        // /api/connections/callback. Left unimplemented on purpose — no fake
        // production OAuth flows.
        return {
          authorizeUrl: null,
          simulated: true,
          credentialsReference: `vault:${provider}/${workspaceId}`,
        };
      }
      return {
        authorizeUrl: null,
        simulated: true,
        credentialsReference: `vault:stub/${provider}/${workspaceId}`,
      };
    },
    async sync() {
      return { status: "connected", note: "Simulated sync" };
    },
  };
}

const adapters: Record<string, ConnectionAdapter> = {
  google_calendar: stubAdapter("google_calendar", [
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
  ]),
  gmail: stubAdapter("gmail", ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"]),
  notion: stubAdapter("notion", ["NOTION_OAUTH_CLIENT_ID", "NOTION_OAUTH_CLIENT_SECRET"]),
  slack: stubAdapter("slack", ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET"]),
  supabase: stubAdapter("supabase", ["CONNECTED_SUPABASE_URL", "CONNECTED_SUPABASE_KEY"]),
  mcp: stubAdapter("mcp", ["MCP_SERVER_URL"]),
};

export function getConnectionAdapter(provider: string): ConnectionAdapter | null {
  return adapters[provider] ?? null;
}
