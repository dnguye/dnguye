"use client";

import { useRef, useState } from "react";
import { ExternalLinkIcon, RotateCcwIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type StageTheme = "light" | "dark" | "split";
type StageBg = "surface" | "canvas" | "grid";

const WIDTHS = [360, 768, 1280] as const;

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex overflow-hidden rounded-md border border-line font-mono text-[11px]"
    >
      {options.map((opt, i) => (
        <button
          key={String(opt.value)}
          type="button"
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 transition-colors",
            i > 0 && "border-l border-line",
            opt.value === value ? "bg-raised text-ink" : "text-muted hover:text-ink"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Honest preview: the demo renders in an iframe pointed at the bare
 * /preview route — real style isolation, real viewport widths.
 */
export function Stage({
  previewPath,
  height = 420,
}: {
  previewPath: string;
  height?: number;
}) {
  const [width, setWidth] = useState<number | "fill">("fill");
  const [theme, setTheme] = useState<StageTheme>("dark");
  const [bg, setBg] = useState<StageBg>("surface");
  const [replayKey, setReplayKey] = useState(0);
  const [measured, setMeasured] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const src = (t: "light" | "dark") => `${previewPath}?theme=${t}&bg=${bg}`;

  function beginDrag(e: React.PointerEvent<HTMLButtonElement>) {
    const current = frameRef.current?.offsetWidth ?? 0;
    dragState.current = { startX: e.clientX, startWidth: current };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onDrag(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragState.current) return;
    // Handle sits on the right edge of a centered frame: 1px of pointer = 2px of width.
    const next = Math.round(
      Math.min(
        Math.max(dragState.current.startWidth + (e.clientX - dragState.current.startX) * 2, 320),
        frameRef.current?.parentElement?.offsetWidth ?? 1280
      )
    );
    setWidth(next);
    setMeasured(next);
  }
  function endDrag() {
    dragState.current = null;
  }

  const frameWidth = width === "fill" ? "100%" : `${width}px`;

  return (
    <section aria-label="Live preview" className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-6 py-3 sm:px-12">
        <Segmented
          label="Preview width"
          options={[
            ...WIDTHS.map((w) => ({ value: w as number | "fill", label: String(w) })),
            { value: "fill" as const, label: "Fill" },
          ]}
          value={width}
          onChange={(v) => {
            setWidth(v);
            setMeasured(typeof v === "number" ? v : null);
          }}
        />
        <Segmented
          label="Preview theme"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "split", label: "Split" },
          ]}
          value={theme}
          onChange={setTheme}
        />
        <Segmented
          label="Preview background"
          options={[
            { value: "surface", label: "Surface" },
            { value: "canvas", label: "Canvas" },
            { value: "grid", label: "Grid" },
          ]}
          value={bg}
          onChange={setBg}
        />
        <span className="hidden font-mono text-[11px] text-faint md:inline">
          {measured ?? (width === "fill" ? "fill" : width)}
          {measured || width !== "fill" ? " px" : ""} × {height} px
        </span>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            className="flex items-center gap-1.5 font-mono text-[11px] text-accent transition-opacity hover:opacity-80"
          >
            <RotateCcwIcon className="size-3.5" />
            Replay
          </button>
          <a
            href={src(theme === "split" ? "dark" : theme)}
            target="_blank"
            rel="noreferrer"
            aria-label="Open preview in a new tab"
            className="text-muted transition-colors hover:text-ink"
          >
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </div>
      </div>
      <div className="border-b border-line bg-raised/40 px-0 sm:px-12">
        <div
          className={cn(
            "relative mx-auto flex justify-center gap-px border-line bg-line sm:border-x",
            theme === "split" && "flex-col md:flex-row"
          )}
          style={{ width: theme === "split" ? "100%" : frameWidth, maxWidth: "100%" }}
          ref={frameRef}
        >
          {(theme === "split" ? (["light", "dark"] as const) : ([theme] as const)).map((t) => (
            <iframe
              key={`${t}-${replayKey}-${bg}`}
              title={`Preview (${t})`}
              src={src(t)}
              className="block w-full"
              style={{ height: `${height}px`, colorScheme: t }}
              loading="lazy"
            />
          ))}
          {theme !== "split" ? (
            <button
              type="button"
              aria-label="Drag to resize preview"
              onPointerDown={beginDrag}
              onPointerMove={onDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="absolute top-1/2 -right-3 hidden h-12 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-line-strong transition-colors hover:bg-accent sm:block"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
