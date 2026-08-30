export function GridBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_30%,white_100%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_30%,#0a0a0a_100%)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function GridBackgroundDemo() {
  return (
    <GridBackground>
      <h2 className="font-serif text-3xl text-neutral-900 dark:text-neutral-100">
        Blueprint grid
      </h2>
    </GridBackground>
  );
}
