const LEVELS = [
  { name: "raised", css: "0 1px 2px rgba(0,0,0,0.06)", use: "inputs, chips" },
  { name: "card", css: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)", use: "cards" },
  { name: "overlay", css: "0 8px 24px rgba(0,0,0,0.14)", use: "popovers, menus" },
  { name: "modal", css: "0 24px 64px rgba(0,0,0,0.24)", use: "dialogs" },
];

export function ElevationRamp() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      {LEVELS.map((level) => (
        <div key={level.name} className="flex flex-col items-center gap-3">
          <div
            className="size-24 rounded-xl bg-white dark:bg-neutral-800 dark:shadow-black/40"
            style={{ boxShadow: level.css }}
          />
          <div className="text-center">
            <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">
              {level.name}
            </div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              {level.use}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
