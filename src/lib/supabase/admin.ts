import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "./config";

/**
 * Service-role client for trusted server-side jobs (the routine scheduler).
 * Bypasses RLS — NEVER import this from client components, and never expose
 * SUPABASE_SERVICE_ROLE_KEY as a NEXT_PUBLIC_ variable.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
