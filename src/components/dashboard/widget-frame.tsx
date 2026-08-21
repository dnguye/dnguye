"use client";

import Link from "next/link";
import { ArrowUpRightIcon, GripVerticalIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Shared chrome for dashboard widgets: header with drag handle + scroll body. */
export function WidgetFrame({
  title,
  icon: Icon,
  href,
  children,
  className,
  draggable = true,
}: {
  title: string;
  icon: LucideIcon;
  href?: string;
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex h-full min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm",
        className
      )}
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
        {draggable ? (
          <GripVerticalIcon className="widget-drag-handle text-muted-foreground/60 size-4 cursor-grab active:cursor-grabbing" />
        ) : null}
        <Icon className="text-muted-foreground size-4" />
        <span className="text-sm font-medium">{title}</span>
        {href ? (
          <Link
            href={href}
            className="text-muted-foreground hover:text-foreground ml-auto transition-colors"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRightIcon className="size-4" />
          </Link>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
