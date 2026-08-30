"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";

function Shell({ fullBleed, children }: { fullBleed?: boolean; children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") === "light" ? "light" : "dark";
  const bg = searchParams.get("bg") ?? "surface";

  // The blocking script in the preview layout already set the class before
  // first paint; this keeps it in sync if the query changes client-side.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <div
      className={cn(
        "min-h-svh",
        bg === "surface" && "bg-surface",
        bg === "canvas" && "bg-canvas",
        bg === "grid" && "stage-bg-grid bg-surface",
        !fullBleed && "flex items-center justify-center p-8"
      )}
    >
      {children}
    </div>
  );
}

export function PreviewShell(props: { fullBleed?: boolean; children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-surface" />}>
      <Shell {...props} />
    </Suspense>
  );
}
