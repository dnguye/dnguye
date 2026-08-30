export function MeshBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#faf8f5] dark:bg-[#100f0e]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            "radial-gradient(40% 55% at 20% 25%, rgba(212, 104, 63, 0.25), transparent 70%)," +
            "radial-gradient(45% 50% at 80% 30%, rgba(120, 130, 220, 0.18), transparent 70%)," +
            "radial-gradient(50% 60% at 55% 85%, rgba(80, 150, 110, 0.16), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function MeshBackgroundDemo() {
  return (
    <MeshBackground>
      <h2 className="font-serif text-3xl text-neutral-900 dark:text-neutral-100">
        Grain and gradient
      </h2>
    </MeshBackground>
  );
}
