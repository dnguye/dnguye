export function CtaBand() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-900 px-8 py-14 sm:px-14 dark:border-neutral-800 dark:bg-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-3xl text-white dark:text-neutral-900">
            Ship something today
          </h2>
          <p className="mt-1.5 text-sm text-neutral-400 dark:text-neutral-600">
            Free for solo projects. No card, no sales call.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="#"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-700"
          >
            Get started
          </a>
          <a
            href="#"
            className="text-sm text-neutral-400 underline underline-offset-4 hover:text-white dark:text-neutral-600 dark:hover:text-neutral-900"
          >
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
