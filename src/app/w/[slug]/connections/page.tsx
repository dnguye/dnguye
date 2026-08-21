"use client";

import { useMemo } from "react";
import {
  BookIcon,
  CalendarIcon,
  DatabaseIcon,
  MailIcon,
  MessageSquareIcon,
  PlugIcon,
  PlugZapIcon,
  RefreshCwIcon,
  UnplugIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { ConnectionStatusBadge } from "@/components/shared/status-badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { PROVIDER_CATALOG, type ProviderInfo } from "@/lib/connections/catalog";
import { useAgents } from "@/lib/queries/use-agents";
import {
  useConnectProvider,
  useConnections,
  useDisconnectProvider,
} from "@/lib/queries/use-connections";
import type { Connection } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

const ICONS = {
  calendar: CalendarIcon,
  mail: MailIcon,
  book: BookIcon,
  "message-square": MessageSquareIcon,
  database: DatabaseIcon,
  plug: PlugIcon,
} as const;

export default function ConnectionsPage() {
  const { workspace, canAdmin } = useWorkspace();
  const { data: connections, isLoading } = useConnections(workspace.id);
  const { data: agents } = useAgents(workspace.id);
  const connectProvider = useConnectProvider(workspace.id);
  const disconnectProvider = useDisconnectProvider(workspace.id);

  const byProvider = useMemo(() => {
    const map = new Map<string, Connection>();
    for (const c of connections ?? []) map.set(c.provider, c);
    return map;
  }, [connections]);

  function handleConnect(info: ProviderInfo, existing?: Connection) {
    connectProvider.mutate(
      {
        provider: info.id,
        connection_id: existing?.id,
        display_name: info.name,
      },
      {
        onSuccess: (result) => {
          if (result.authorize_url) {
            window.location.href = result.authorize_url;
            return;
          }
          toast.success(`${info.name} connected`, {
            description:
              "Simulated OAuth flow — configure real provider credentials to go live (see README). Tokens stay server-side either way.",
          });
        },
        onError: (error) =>
          toast.error("Connection failed", { description: error.message }),
      }
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Connections"
        description="External tools your agents can use. Credentials live server-side only; every external write still requires approval."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PROVIDER_CATALOG.map((info) => {
            const connection = byProvider.get(info.id);
            const status = connection?.status ?? "disconnected";
            const Icon = ICONS[info.icon];
            const allowedAgents = (agents ?? []).filter((a) =>
              connection?.allowed_agent_ids?.includes(a.id)
            );
            return (
              <Card key={info.id} className="gap-3">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="bg-muted flex size-9 items-center justify-center rounded-lg">
                      <Icon className="size-4" />
                    </div>
                    <ConnectionStatusBadge status={status} />
                  </div>
                  <CardTitle className="pt-1">
                    {connection?.display_name ?? info.name}
                  </CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <p>
                      Scopes:{" "}
                      {(connection?.scopes?.length
                        ? connection.scopes
                        : info.defaultScopes
                      ).join(", ") || "none"}
                    </p>
                    <p>
                      Last sync:{" "}
                      {connection?.last_sync_at
                        ? formatRelative(connection.last_sync_at)
                        : "never"}
                    </p>
                    {status === "attention" &&
                    typeof connection?.metadata?.note === "string" ? (
                      <p className="text-warning">{connection.metadata.note}</p>
                    ) : null}
                  </div>
                  {allowedAgents.length ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-muted-foreground text-xs">Agents:</span>
                      {allowedAgents.map((agent) => (
                        <Badge key={agent.id} variant="muted">
                          {agent.avatar ?? "🤖"} {agent.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center gap-2 pt-1">
                    {status === "disconnected" ? (
                      <Button
                        size="sm"
                        disabled={!canAdmin || connectProvider.isPending}
                        onClick={() => handleConnect(info, connection)}
                      >
                        <PlugZapIcon /> Connect
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant={status === "attention" ? "default" : "secondary"}
                          disabled={!canAdmin || connectProvider.isPending}
                          onClick={() => handleConnect(info, connection)}
                        >
                          <RefreshCwIcon />
                          {status === "attention" ? "Reauthorize" : "Sync"}
                        </Button>
                        {connection ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!canAdmin || disconnectProvider.isPending}
                            onClick={() =>
                              disconnectProvider.mutate(connection, {
                                onSuccess: () =>
                                  toast.success(`${info.name} disconnected`),
                                onError: (error) =>
                                  toast.error("Disconnect failed", {
                                    description: error.message,
                                  }),
                              })
                            }
                          >
                            <UnplugIcon /> Disconnect
                          </Button>
                        ) : null}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {!canAdmin ? (
        <p className="text-muted-foreground text-sm">
          Only workspace admins can manage connections.
        </p>
      ) : null}
    </div>
  );
}
