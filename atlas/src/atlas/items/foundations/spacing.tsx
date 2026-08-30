const STEPS = [4, 8, 12, 16, 24, 32, 48, 64];

export function SpacingScale() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2.5">
      {STEPS.map((px) => (
        <div key={px} className="flex items-center gap-4">
          <span className="w-8 text-right font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
            {px}
          </span>
          <div
            className="h-4 rounded-sm bg-orange-600/80 dark:bg-orange-500/80"
            style={{ width: `${px * 4}px` }}
          />
          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
            {px <= 8 ? "inside controls" : px <= 16 ? "between siblings" : px <= 32 ? "between groups" : "between sections"}
          </span>
        </div>
      ))}
    </div>
  );
}
