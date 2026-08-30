export function FadeRise({
  children,
  stagger = 90,
}: {
  children: React.ReactNode[];
  stagger?: number;
}) {
  return (
    <div>
      <style>{`
        @keyframes fade-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-rise-item {
          opacity: 0;
          animation: fade-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-rise-item { animation: none; opacity: 1; }
        }
      `}</style>
      {children.map((child, i) => (
        <div key={i} className="fade-rise-item" style={{ animationDelay: `${i * stagger}ms` }}>
          {child}
        </div>
      ))}
    </div>
  );
}

export function FadeRiseDemo() {
  return (
    <FadeRise>
      <h2 className="font-serif text-3xl text-neutral-900 dark:text-neutral-100">
        The quarterly report
      </h2>
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
        Revenue grew 24% quarter over quarter.
      </p>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Churn fell below two percent for the first time.
      </p>
      <div className="mt-5 flex gap-2.5">
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
          Read more
        </button>
        <button className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
          Share
        </button>
      </div>
    </FadeRise>
  );
}
