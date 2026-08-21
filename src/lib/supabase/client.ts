"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client (singleton). Uses the anon key only — all data
 * access is constrained by Row Level Security. Provider tokens and other
 * secrets never reach this client.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      isSupabaseConfigured ? SUPABASE_URL : "http://localhost:54321",
      isSupabaseConfigured ? SUPABASE_ANON_KEY : "unconfigured-anon-key"
    );
  }
  return client;
}
