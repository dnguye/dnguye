export function DotsBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.14)_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,transparent_25%,white_95%)] dark:bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,transparent_25%,#0a0a0a_95%)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function DotsBackgroundDemo() {
  return (
    <DotsBackground>
      <h2 className="font-serif text-3xl text-neutral-900 dark:text-neutral-100">
        Perforated field
      </h2>
    </DotsBackground>
  );
}
