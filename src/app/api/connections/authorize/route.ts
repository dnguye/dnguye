import { NextResponse } from "next/server";
import { z } from "zod";

import { getConnectionAdapter } from "@/lib/connections/adapters";
import { providerInfo } from "@/lib/connections/catalog";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  workspace_id: z.string().uuid(),
  provider: z.string().min(1),
  connection_id: z.string().uuid().optional(),
  display_name: z.string().max(80).optional(),
});

/**
 * OAuth flow entry point (stubbed). With real provider credentials configured
 * this returns an `authorize_url` for the consent redirect; without them it
 * simulates a successful connection so the rest of the product can be
 * exercised. Credentials are represented only by an opaque vault reference —
 * no tokens are stored in the database or returned to the client.
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { workspace_id, provider, connection_id, display_name } = parsed.data;

  const adapter = getConnectionAdapter(provider);
  if (!adapter) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  // Ensure a connection row exists (RLS restricts this to workspace admins).
  let connectionId = connection_id ?? null;
  if (!connectionId) {
    const info = providerInfo(provider);
    const { data, error } = await supabase
      .from("connections")
      .insert({
        workspace_id,
        provider,
        display_name: display_name ?? info.name,
        status: "disconnected",
        scopes: info.defaultScopes,
      })
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not create connection" },
        { status: 500 }
      );
    }
    connectionId = data.id as string;
  }

  const result = adapter.getAuthorizeUrl({
    workspaceId: workspace_id,
    connectionId,
  });

  if (result.authorizeUrl) {
    return NextResponse.json({ status: "redirect", authorize_url: result.authorizeUrl });
  }

  // Simulated flow: mark connected with an opaque credentials reference.
  const { error: updateError } = await supabase
    .from("connections")
    .update({
      status: "connected",
      encrypted_credentials_reference: result.credentialsReference,
      last_sync_at: new Date().toISOString(),
    })
    .eq("id", connectionId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("audit_events").insert({
    workspace_id,
    actor_id: user.id,
    actor_type: "user",
    event_type: "connection.connected",
    entity_type: "connection",
    entity_id: connectionId,
    payload: { provider, simulated: result.simulated },
  });

  return NextResponse.json({ status: "connected", simulated: result.simulated });
}
