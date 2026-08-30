const TONES = {
  neutral: "border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300",
  accent: "border-orange-700/40 bg-orange-500/10 text-orange-800 dark:text-orange-300",
  success: "border-emerald-700/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  warning: "border-amber-700/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  danger: "border-red-700/40 bg-red-500/10 text-red-800 dark:text-red-300",
} as const;

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: keyof typeof TONES;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${TONES[tone]}`}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function BadgeSetDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>draft</Badge>
      <Badge tone="accent">beta</Badge>
      <Badge tone="success" dot>running</Badge>
      <Badge tone="warning" dot>degraded</Badge>
      <Badge tone="danger">failed</Badge>
    </div>
  );
}
