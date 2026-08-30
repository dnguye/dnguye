"use client";

import { useState } from "react";
import { RotateCcwIcon } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Client shell around a tile's (server-rendered) preview: the replay button
 * re-mounts the subtree, so CSS animations and demo effects run again.
 */
export function TileStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [generation, setGeneration] = useState(0);

  return (
    <>
      <div
        key={generation}
        className={cn("pointer-events-none relative isolate h-[180px] overflow-hidden bg-surface", className)}
        style={{ containerType: "inline-size" }}
        aria-hidden="true"
        inert
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Replay preview"
        onClick={() => setGeneration((g) => g + 1)}
        className="absolute top-2 right-2 z-20 flex size-7 items-center justify-center rounded-md border border-line bg-canvas/80 text-faint backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
      >
        <RotateCcwIcon className="size-3" />
      </button>
    </>
  );
}
