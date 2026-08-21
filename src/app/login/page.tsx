"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BotIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setPending(false);
    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      toast.success("Check your inbox", {
        description: "Confirm your email address to finish signing up.",
      });
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-xl">
            <BotIcon className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Agentic Workspace</h1>
          <p className="text-muted-foreground text-sm">
            Your command center for agents, skills, and automations.
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <Card>
            <CardHeader>
              <CardTitle>Setup required</CardTitle>
              <CardDescription>
                Add your Supabase URL and anon key to <code>.env.local</code> (see{" "}
                <code>.env.example</code>) and restart the app.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <Card>
                <CardContent className="pt-2">
                  <form onSubmit={signIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? <Loader2Icon className="animate-spin" /> : null}
                      Sign in
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card>
                <CardContent className="pt-2">
                  <form onSubmit={signUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-email">Email</Label>
                      <Input
                        id="new-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? <Loader2Icon className="animate-spin" /> : null}
                      Create account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}
