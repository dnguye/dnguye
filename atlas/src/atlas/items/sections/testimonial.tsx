export function Testimonial() {
  return (
    <section className="border-b border-neutral-200 bg-white px-8 py-16 sm:px-14 dark:border-neutral-800 dark:bg-neutral-950">
      <figure className="mx-auto max-w-2xl text-center">
        <div aria-hidden="true" className="font-serif text-5xl leading-none text-orange-600/40 dark:text-orange-400/40">
          &ldquo;
        </div>
        <blockquote className="mt-2 font-serif text-2xl leading-snug text-neutral-900 sm:text-[28px] dark:text-neutral-100">
          We deleted four hundred lines of deploy scripts the first week. The
          second week, we stopped thinking about deploys at all.
        </blockquote>
        <figcaption className="mt-6">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-neutral-200 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            RK
          </div>
          <div className="mt-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Rivka Khan
          </div>
          <div className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
            Platform lead, Halde
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
