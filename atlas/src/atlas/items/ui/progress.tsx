export function ProgressBar({
  label,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-neutral-800 dark:text-neutral-200">{label}</span>
        <span className="font-mono text-[11px] text-neutral-400 tabular-nums">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
      >
        <div
          className="h-full rounded-full bg-neutral-900 transition-[width] duration-500 motion-reduce:transition-none dark:bg-neutral-100"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function IndeterminateBar({ label }: { label: string }) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <span className="text-sm text-neutral-800 dark:text-neutral-200">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        className="relative h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
      >
        <style>{`
          @keyframes progress-slide {
            from { transform: translateX(-110%); }
            to { transform: translateX(260%); }
          }
          .progress-slide { animation: progress-slide 1.2s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .progress-slide { animation: none; transform: none; width: 100%; opacity: 0.5; }
          }
        `}</style>
        <div className="progress-slide absolute h-full w-2/5 rounded-full bg-orange-600 will-change-transform dark:bg-orange-500" />
      </div>
    </div>
  );
}

export function ProgressDemo() {
  return (
    <div className="flex w-72 flex-col gap-5">
      <ProgressBar label="Uploading assets" value={64} />
      <ProgressBar label="Index rebuild" value={31} />
      <IndeterminateBar label="Provisioning…" />
    </div>
  );
}
