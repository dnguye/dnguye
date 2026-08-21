import type { SupabaseClient } from "@supabase/supabase-js";

import type { Json } from "@/lib/types";

/**
 * Append an event to the immutable audit log. Failures are logged but never
 * block the primary action — auditing is best-effort from the client, and
 * critical paths (runs, approvals) also record events server-side.
 */
export async function recordAudit(
  supabase: SupabaseClient,
  event: {
    workspace_id: string;
    event_type: string;
    entity_type: string;
    entity_id?: string | null;
    payload?: Record<string, Json>;
    actor_type?: "user" | "agent" | "system";
  }
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("audit_events").insert({
    workspace_id: event.workspace_id,
    actor_id: user?.id ?? null,
    actor_type: event.actor_type ?? "user",
    event_type: event.event_type,
    entity_type: event.entity_type,
    entity_id: event.entity_id ?? null,
    payload: event.payload ?? {},
  });
  if (error) {
    console.warn("audit event failed", event.event_type, error.message);
  }
}
