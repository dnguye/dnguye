"use client";

import { SparklesIcon } from "lucide-react";

import { CopyButton } from "./copy-button";

/**
 * The hand-off block: one structured prompt a coding agent can act on
 * without seeing this site — task, requirements, full source, acceptance.
 */
export function HandoffBox({ text }: { text: string }) {
  const lineCount = text.split("\n").length;
  return (
    <section
      aria-label="Agent hand-off"
      className="flex flex-col overflow-hidden rounded-lg border border-accent/35"
    >
      <div className="flex items-center justify-between gap-3 border-b border-accent/35 bg-accent/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-accent" />
          <span className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
            Hand-off · paste into your agent
          </span>
        </div>
        <CopyButton text={text} label="Copy prompt" variant="accent" />
      </div>
      <pre className="max-h-[480px] overflow-auto bg-surface px-5 py-4 font-mono text-[11.5px] leading-[1.8] whitespace-pre-wrap text-muted [&_br]:hidden">
        {text}
      </pre>
      <div className="border-t border-accent/35 bg-accent/[0.06] px-4 py-2 font-mono text-[10px] tracking-[0.06em] text-faint uppercase">
        Includes full source · {lineCount} lines total
      </div>
    </section>
  );
}
