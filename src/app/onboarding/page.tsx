"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SparklesIcon, PlusIcon } from "lucide-react";
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
import { workspaceSchema } from "@/lib/schemas";
import {
  useCreateWorkspace,
  useSeedDemoWorkspace,
} from "@/lib/queries/use-workspaces";
import { slugify } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const createWorkspace = useCreateWorkspace();
  const seedDemo = useSeedDemoWorkspace();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const parsed = workspaceSchema.safeParse({ name, slug });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid workspace details");
      return;
    }
    createWorkspace.mutate(parsed.data, {
      onSuccess: (workspace) => {
        toast.success("Workspace created");
        router.push(`/w/${workspace.slug}/dashboard`);
      },
      onError: (error) =>
        toast.error("Could not create workspace", { description: error.message }),
    });
  }

  function handleSeed() {
    seedDemo.mutate(undefined, {
      onSuccess: ({ slug: demoSlug }) => {
        toast.success("Demo workspace ready", {
          description: "Agents, skills, routines, and sample data seeded.",
        });
        router.push(`/w/${demoSlug}/dashboard`);
      },
      onError: (error) =>
        toast.error("Seeding failed", { description: error.message }),
    });
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusIcon className="size-4" /> Create a workspace
            </CardTitle>
            <CardDescription>Start from a clean slate.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Name</Label>
                <Input
                  id="ws-name"
                  placeholder="Acme Research"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-slug">URL slug</Label>
                <Input
                  id="ws-slug"
                  placeholder="acme-research"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createWorkspace.isPending}>
                {createWorkspace.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : null}
                Create workspace
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-4" /> Seed a demo workspace
            </CardTitle>
            <CardDescription>
              One click provisions agents, skills, routines, runs, artifacts, a knowledge
              graph, and connections so you can explore everything immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-end gap-3">
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• 3 agents with different permission profiles</li>
              <li>• 5 example skills with schemas and references</li>
              <li>• Scheduled routines and run history</li>
              <li>• A navigable second-brain graph with a router document</li>
            </ul>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleSeed}
              disabled={seedDemo.isPending}
            >
              {seedDemo.isPending ? <Loader2Icon className="animate-spin" /> : null}
              Seed demo workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
