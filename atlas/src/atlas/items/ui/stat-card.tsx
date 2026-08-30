const STATS = [
  { label: "Monthly recurring revenue", value: "$48,210", delta: "+8.2%", up: true },
  { label: "Active workspaces", value: "1,284", delta: "+112", up: true },
  { label: "Churn", value: "1.9%", delta: "-0.4pt", up: false },
];

export function StatCard({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[26px] text-neutral-900 tabular-nums dark:text-neutral-100">
          {value}
        </span>
        <span
          className={`font-mono text-[11px] ${
            up ? "text-emerald-700 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

export function StatCardDemo() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
      {STATS.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
