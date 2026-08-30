export function Marquee({
  children,
  duration = 24,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  return (
    <div className="group relative flex overflow-hidden">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .marquee-track {
          animation: marquee var(--marquee-duration, 24s) linear infinite;
        }
        .group:hover .marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="marquee-track flex shrink-0 items-center"
          style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export function MarqueeDemo() {
  const names = ["ACME", "NORTH", "HALDE", "OSSA", "VELA", "QUARRY", "LUMEN"];
  return (
    <div className="w-full max-w-xl border-y border-neutral-200 py-4 dark:border-neutral-800">
      <Marquee>
        {names.map((name) => (
          <span
            key={name}
            className="mx-8 font-mono text-sm tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
