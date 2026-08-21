-- Demo data is seeded per-user via the `seed_demo_workspace()` RPC
-- (see supabase/migrations/00004_seed_demo.sql), because every row is scoped
-- to a workspace owned by a real auth user. After signing in, click
-- "Seed demo workspace" in the app, or run from SQL with an authenticated
-- session: select public.seed_demo_workspace();
select 1;
