"use client";

import { useState } from "react";

const CURVES = [
  { name: "ease-out-quart", value: "cubic-bezier(0.25, 1, 0.5, 1)", use: "entrances" },
  { name: "ease-out-expo", value: "cubic-bezier(0.16, 1, 0.3, 1)", use: "large moves" },
  { name: "ease-in-out-cubic", value: "cubic-bezier(0.65, 0, 0.35, 1)", use: "position swaps" },
  { name: "ease-spring-soft", value: "cubic-bezier(0.34, 1.3, 0.64, 1)", use: "playful pops" },
  { name: "ease-anticipate", value: "cubic-bezier(0.36, 0, 0.66, -0.56)", use: "exits" },
];

export function EasingCurves() {
  const [copied, setCopied] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  return (
    <div className="w-full max-w-md divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {CURVES.map((curve) => (
        <button
          key={curve.name}
          onClick={async () => {
            setRunning(curve.name);
            setTimeout(() => setRunning(null), 900);
            try {
              await navigator.clipboard.writeText(curve.value);
              setCopied(curve.name);
              setTimeout(() => setCopied(null), 1400);
            } catch {}
          }}
          className="group flex w-full items-center gap-4 py-3 text-left"
        >
          <div className="w-36 shrink-0">
            <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">
              {curve.name}
            </div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              {curve.use}
            </div>
          </div>
          <div className="relative h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full bg-orange-600 motion-reduce:transition-none dark:bg-orange-500"
              style={{
                transition: running === curve.name ? `left 0.8s ${curve.value}` : "none",
                left: running === curve.name ? "calc(100% - 12px)" : "0",
              }}
            />
          </div>
          <span className="w-14 shrink-0 text-right font-mono text-[10px] text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-500">
            {copied === curve.name ? "copied" : "copy"}
          </span>
        </button>
      ))}
    </div>
  );
}
