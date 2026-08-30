const STEPS = [
  { name: "sm", px: 4, use: "chips, kbd" },
  { name: "md", px: 6, use: "buttons, inputs" },
  { name: "lg", px: 8, use: "cards, code blocks" },
  { name: "xl", px: 12, use: "dialogs, stages" },
  { name: "full", px: 999, use: "pills, avatars" },
];

export function RadiusScale() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      {STEPS.map((step) => (
        <div key={step.name} className="flex flex-col items-center gap-3">
          <div
            className="size-20 border-2 border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800"
            style={{ borderRadius: step.px }}
          />
          <div className="text-center">
            <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">
              {step.name} · {step.px === 999 ? "9999" : step.px}px
            </div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              {step.use}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
