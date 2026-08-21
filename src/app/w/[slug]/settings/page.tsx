"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SparklesIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSeedDemoWorkspace,
  useWorkspaceMembers,
} from "@/lib/queries/use-workspaces";
import { queryKeys } from "@/lib/queries/keys";
import { initials } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { workspace, canAdmin } = useWorkspace();
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const { data: members, isLoading: membersLoading } = useWorkspaceMembers(workspace.id);
  const seedDemo = useSeedDemoWorkspace();

  const [name, setName] = useState(workspace.name);
  const [saving, setSaving] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("workspaces")
      .update({ name })
      .eq("id", workspace.id);
    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    toast.success("Workspace renamed");
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
  }

  async function deleteWorkspace() {
    const { error } = await supabase.from("workspaces").delete().eq("id", workspace.id);
    if (error) {
      toast.error("Delete failed", { description: error.message });
      return;
    }
    toast.success("Workspace deleted");
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    router.push("/");
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Workspace configuration and membership." />

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveName} className="flex max-w-md items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canAdmin}
              />
            </div>
            <Button type="submit" disabled={!canAdmin || saving || name === workspace.name}>
              {saving ? <Loader2Icon className="animate-spin" /> : null}
              Save
            </Button>
          </form>
          <p className="text-muted-foreground mt-3 text-sm">
            Slug: <code className="bg-muted rounded px-1">{workspace.slug}</code>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-4" /> Members
          </CardTitle>
          <CardDescription>
            Roles: owner and admin manage the workspace, members can run and edit,
            viewers are read-only. Invites are managed in Supabase Auth for now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <ul className="divide-y">
              {(members ?? []).map((member) => (
                <li key={member.user_id} className="flex items-center gap-3 py-2.5">
                  <Avatar>
                    <AvatarFallback>
                      {initials(member.profile?.full_name ?? member.profile?.email ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.profile?.full_name ?? member.profile?.email ?? member.user_id}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {member.profile?.email}
                    </p>
                  </div>
                  <Badge variant={member.role === "owner" ? "default" : "muted"}>
                    {member.role}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4" /> Demo data
          </CardTitle>
          <CardDescription>
            Provision a fresh demo workspace with agents, skills, routines, runs,
            artifacts, and a knowledge graph.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            disabled={seedDemo.isPending}
            onClick={() =>
              seedDemo.mutate(undefined, {
                onSuccess: ({ slug }) => {
                  toast.success("Demo workspace ready");
                  router.push(`/w/${slug}/dashboard`);
                },
                onError: (error) =>
                  toast.error("Seeding failed", { description: error.message }),
              })
            }
          >
            {seedDemo.isPending ? <Loader2Icon className="animate-spin" /> : null}
            Seed demo workspace
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting the workspace removes all agents, skills, runs, artifacts, and
            knowledge. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={!canAdmin}>
                <Trash2Icon /> Delete workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {workspace.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  All data in this workspace will be permanently deleted for every member.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={deleteWorkspace}
                >
                  Delete forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
