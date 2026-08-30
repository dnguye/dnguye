"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";

export type CodeFile = {
  /** Tab label / suggested destination path. */
  path: string;
  /** Raw source, for the copy button. */
  raw: string;
  /** Shiki-highlighted HTML, rendered on the server. */
  html: string;
  lines: number;
};

const COLLAPSE_AT = 24;

export function CodeBox({ files }: { files: CodeFile[] }) {
  const [active, setActive] = useState(0);
  const [wrap, setWrap] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const file = files[active];
  const collapsible = file.lines > COLLAPSE_AT;

  return (
    <section
      aria-label="Source code"
      className="flex flex-col overflow-hidden rounded-lg border border-line"
    >
      <div className="flex items-center border-b border-line bg-surface">
        <div role="tablist" className="flex overflow-x-auto">
          {files.map((f, i) => (
            <button
              key={f.path}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setActive(i);
                setExpanded(false);
              }}
              className={cn(
                "-mb-px border-b px-4 py-2.5 font-mono text-[11px] whitespace-nowrap transition-colors",
                i === active
                  ? "border-accent text-ink"
                  : "border-transparent text-faint hover:text-muted"
              )}
            >
              {f.path.split("/").pop()}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 pr-3">
          <button
            type="button"
            onClick={() => setWrap((w) => !w)}
            aria-pressed={wrap}
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-[10px] transition-colors",
              wrap ? "border-line-strong text-ink" : "border-line text-faint hover:text-muted"
            )}
          >
            Wrap
          </button>
          <CopyButton text={file.raw} />
        </div>
      </div>
      <div
        className={cn(
          "code-numbers overflow-x-auto bg-surface py-4 font-mono text-xs leading-[1.75]",
          wrap && "code-wrap",
          collapsible && !expanded && "max-h-[480px] overflow-y-hidden"
        )}
        // Server-highlighted by Shiki from our own registry sources.
        dangerouslySetInnerHTML={{ __html: file.html }}
      />
      <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-2">
        <span className="font-mono text-[10px] tracking-[0.06em] text-faint uppercase">
          {file.lines} lines · {file.path}
        </span>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase hover:text-accent"
          >
            {expanded ? "Collapse" : "Show all"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
