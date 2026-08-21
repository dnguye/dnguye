export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True when the public Supabase env vars are present. The app renders a
 * setup notice instead of crashing when they are missing (e.g. a fresh
 * clone before `.env.local` exists, or a preview build without env).
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
