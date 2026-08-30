export function EditorialHero() {
  return (
    <section className="border-b border-neutral-200 bg-[#f6f4ef] px-8 py-20 sm:px-16 dark:border-neutral-800 dark:bg-[#121110]">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
          Field notes · Issue 12
        </p>
        <h1 className="mt-5 font-serif text-5xl leading-[1.06] text-neutral-900 sm:text-6xl dark:text-neutral-100">
          Write once.
          <br />
          <span className="italic">Publish with intent.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          A publishing tool for teams who care how their words look. Draft together,
          review inline, and ship to web and email from one source.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#"
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Start writing
          </a>
          <a
            href="#"
            className="text-sm text-neutral-600 underline underline-offset-4 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Read the manifesto
          </a>
        </div>
      </div>
    </section>
  );
}
