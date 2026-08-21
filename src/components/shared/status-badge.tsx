import {
  AlertTriangleIcon,
  BanIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  Loader2Icon,
  PauseCircleIcon,
  PlugIcon,
  PlugZapIcon,
  ShieldAlertIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AgentStatus, ConnectionStatus, RunStatus } from "@/lib/types";

export function RunStatusBadge({ status }: { status: RunStatus }) {
  switch (status) {
    case "queued":
      return (
        <Badge variant="muted">
          <CircleDashedIcon /> Queued
        </Badge>
      );
    case "running":
      return (
        <Badge variant="secondary">
          <Loader2Icon className="animate-spin" /> Running
        </Badge>
      );
    case "needs_approval":
      return (
        <Badge variant="warning">
          <ShieldAlertIcon /> Needs approval
        </Badge>
      );
    case "succeeded":
      return (
        <Badge variant="success">
          <CheckCircle2Icon /> Succeeded
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircleIcon /> Failed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="muted">
          <BanIcon /> Cancelled
        </Badge>
      );
  }
}

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="success">
          <span className="size-1.5 rounded-full bg-current" /> Active
        </Badge>
      );
    case "paused":
      return (
        <Badge variant="warning">
          <PauseCircleIcon /> Paused
        </Badge>
      );
    case "archived":
      return <Badge variant="muted">Archived</Badge>;
  }
}

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case "connected":
      return (
        <Badge variant="success">
          <PlugZapIcon /> Connected
        </Badge>
      );
    case "attention":
      return (
        <Badge variant="warning">
          <AlertTriangleIcon /> Attention
        </Badge>
      );
    case "disconnected":
      return (
        <Badge variant="muted">
          <PlugIcon /> Disconnected
        </Badge>
      );
  }
}
