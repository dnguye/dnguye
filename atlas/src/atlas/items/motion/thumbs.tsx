/** Tile-sized stand-ins for demos that need real viewport room to make sense. */

export function ScrollProgressThumb() {
  return (
    <div className="w-56">
      <div className="h-0.5 w-full bg-neutral-200 dark:bg-neutral-800">
        <div className="h-full w-2/3 bg-orange-600 dark:bg-orange-500" />
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-2.5 w-4/5 rounded-sm bg-neutral-300/80 dark:bg-neutral-700/80" />
        <div className="h-2.5 w-full rounded-sm bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-2.5 w-3/4 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="mt-3 text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
        67% read
      </div>
    </div>
  );
}

export function RevealOnScrollThumb() {
  return (
    <div className="flex w-56 flex-col gap-2.5">
      <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="h-2.5 w-1/2 rounded-sm bg-neutral-400/80 dark:bg-neutral-500/80" />
        <div className="mt-2 h-2 w-4/5 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="translate-y-1 rounded-lg border border-neutral-200 bg-white p-3 opacity-60 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-2.5 w-1/2 rounded-sm bg-neutral-300 dark:bg-neutral-600" />
        <div className="mt-2 h-2 w-4/5 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="translate-y-2 rounded-lg border border-neutral-200 bg-white p-3 opacity-25 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-2.5 w-1/2 rounded-sm bg-neutral-300 dark:bg-neutral-600" />
      </div>
    </div>
  );
}
