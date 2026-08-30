export function SplitHero() {
  return (
    <section className="grid border-b border-neutral-200 bg-white md:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col justify-center px-8 py-16 sm:px-14">
        <p className="font-mono text-[11px] tracking-[0.2em] text-orange-700 uppercase dark:text-orange-400">
          Now in public beta
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-neutral-900 sm:text-5xl dark:text-neutral-100">
          The command line for your infrastructure
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          Deploy, inspect, and roll back across every environment from one prompt —
          with an audit trail your compliance team will actually read.
        </p>
        <div className="mt-7 flex items-center gap-3">
          <a
            href="#"
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Install
          </a>
          <code className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            curl -fsSL vantage.sh | sh
          </code>
        </div>
      </div>
      <div className="flex items-center justify-center border-t border-neutral-200 bg-neutral-50 p-10 md:border-t-0 md:border-l dark:border-neutral-800 dark:bg-neutral-900">
        <div className="w-full max-w-sm overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-950">
          <div className="flex items-center gap-1.5 border-b border-neutral-200 px-3 py-2.5 dark:border-neutral-800">
            <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </div>
          <pre className="p-4 font-mono text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
{`$ vantage deploy --env prod
✓ built in 4.2s
✓ 3 regions updated
✓ healthy — rollback armed`}
          </pre>
        </div>
      </div>
    </section>
  );
}
