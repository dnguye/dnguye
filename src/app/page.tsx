import Link from "next/link";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <div className="bg-card w-full max-w-lg space-y-4 rounded-xl border p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Agentic Workspace — setup required</h1>
          <p className="text-muted-foreground text-sm">
            Supabase environment variables are missing. Copy{" "}
            <code className="bg-muted rounded px-1 py-0.5">.env.example</code> to{" "}
            <code className="bg-muted rounded px-1 py-0.5">.env.local</code>, fill in{" "}
            <code className="bg-muted rounded px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="bg-muted rounded px-1 py-0.5">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            , apply the SQL migrations in{" "}
            <code className="bg-muted rounded px-1 py-0.5">supabase/migrations</code>, and
            restart the dev server.
          </p>
          <p className="text-muted-foreground text-sm">
            Full instructions live in the{" "}
            <Link className="text-primary underline underline-offset-2" href="https://github.com/dnguye/dnguye#readme">
              README
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace:workspaces(slug)")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const slug = (membership?.workspace as { slug?: string } | null)?.slug;
  redirect(slug ? `/w/${slug}/dashboard` : "/onboarding");
}
