import { cloneElement, useId } from "react";

export function Tooltip({
  label,
  children,
}: {
  label: string;
  /** A single focusable element — the tooltip id is attached to it. */
  children: React.ReactElement<{ "aria-describedby"?: string }>;
}) {
  const id = useId();
  return (
    <span className="group/tip relative inline-flex">
      {/* aria-describedby must sit on the focused element itself, or screen
          readers never announce the description. */}
      {cloneElement(children, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-md transition-all duration-150 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 motion-reduce:transition-none dark:bg-neutral-100 dark:text-neutral-900"
      >
        {label}
        <span className="absolute top-full left-1/2 -mt-px size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-neutral-900 dark:bg-neutral-100" />
      </span>
    </span>
  );
}

export function TooltipDemo() {
  return (
    <div className="flex items-center gap-3 pt-8">
      {[
        { label: "Download report", glyph: "↓" },
        { label: "Copy share link", glyph: "⧉" },
        { label: "Delete forever", glyph: "×" },
      ].map((action) => (
        <Tooltip key={action.label} label={action.label}>
          <button className="flex size-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
            <span aria-hidden="true">{action.glyph}</span>
            <span className="sr-only">{action.label}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
