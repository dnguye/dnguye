const LOGOS = ["ACME", "NORTH & CO", "HALDE", "OSSA", "VELA", "QUARRY"];

export function LogoCloud() {
  return (
    <section className="border-b border-neutral-200 bg-white px-8 py-12 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-center font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
        Trusted by teams at
      </p>
      <div className="mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-x-12 gap-y-5">
        {LOGOS.map((logo) => (
          <span
            key={logo}
            className="font-serif text-lg tracking-wide text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}
