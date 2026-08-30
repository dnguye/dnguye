"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export function CopyButton({
  text,
  label = "Copy",
  variant = "outline",
  className,
}: {
  text: string;
  label?: string;
  variant?: "outline" | "accent";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1600);
        } catch {
          // Clipboard unavailable (permissions/insecure context) — nothing to signal.
        }
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] transition-colors",
        variant === "accent"
          ? "bg-accent font-medium text-accent-ink hover:opacity-90"
          : "border border-line text-muted hover:border-line-strong hover:text-ink",
        className
      )}
    >
      {copied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
