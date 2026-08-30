const COLUMNS = [
  { heading: "Product", links: ["Features", "Pricing", "Changelog", "Status"] },
  { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { heading: "Resources", links: ["Docs", "API reference", "Community", "Support"] },
  { heading: "Legal", links: ["Privacy", "Terms", "Security"] },
];

export function Footer() {
  return (
    <footer className="bg-white px-8 pt-14 pb-8 sm:px-14 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="font-serif text-xl text-neutral-900 dark:text-neutral-100">Vantage</div>
          <p className="mt-2 max-w-[26ch] text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Infrastructure that stays out of the way.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <div className="font-mono text-[10px] tracking-[0.15em] text-neutral-400 uppercase dark:text-neutral-500">
              {col.heading}
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[13px] text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-4xl items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
          © 2026 Vantage Systems
        </span>
        <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
          All systems normal
        </span>
      </div>
    </footer>
  );
}
