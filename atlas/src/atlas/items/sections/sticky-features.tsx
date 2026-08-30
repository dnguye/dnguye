const STEPS = [
  { title: "Connect the repo", body: "Point the CLI at any Git remote. Monorepos, submodules, and worktrees all resolve correctly on the first run." },
  { title: "Describe the stack", body: "One declarative file covers services, jobs, and cron. Environments derive from it — no drift between staging and prod." },
  { title: "Ship on merge", body: "Merges deploy automatically behind health checks. A failed check rolls back before anyone is paged." },
];

export function StickyFeatures() {
  return (
    <section className="border-b border-neutral-200 bg-white px-8 py-16 sm:px-14 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <div className="md:sticky md:top-16 md:self-start">
          <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-neutral-900 dark:text-neutral-100">
            Three steps, then it&apos;s boring forever
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            The left column stays pinned while the steps scroll — a pattern for
            walkthroughs that keeps context on screen.
          </p>
        </div>
        <div className="flex flex-col gap-10">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <div className="font-mono text-[10px] text-orange-700 dark:text-orange-400">
                STEP {i + 1}
              </div>
              <div className="mt-2 text-base font-medium text-neutral-900 dark:text-neutral-100">
                {step.title}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
