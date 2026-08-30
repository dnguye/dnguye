const STYLES = {
  info: {
    wrap: "border-sky-700/30 bg-sky-500/10 text-sky-900 dark:text-sky-200",
    mark: "bg-sky-600",
  },
  success: {
    wrap: "border-emerald-700/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
    mark: "bg-emerald-600",
  },
  warning: {
    wrap: "border-amber-700/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
    mark: "bg-amber-500",
  },
  danger: {
    wrap: "border-red-700/30 bg-red-500/10 text-red-900 dark:text-red-200",
    mark: "bg-red-600",
  },
} as const;

export function Alert({
  tone,
  title,
  children,
}: {
  tone: keyof typeof STYLES;
  title: string;
  children: React.ReactNode;
}) {
  const style = STYLES[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex gap-3 rounded-lg border px-4 py-3 ${style.wrap}`}>
      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${style.mark}`} aria-hidden="true" />
      <div className="text-sm">
        <div className="font-medium">{title}</div>
        <div className="mt-0.5 opacity-80">{children}</div>
      </div>
    </div>
  );
}

export function AlertsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert tone="info" title="Heads up">A new version of the CLI is available.</Alert>
      <Alert tone="success" title="Deployed">Build 214 is live on production.</Alert>
      <Alert tone="warning" title="Certificate expiring">Renew within 14 days to avoid downtime.</Alert>
      <Alert tone="danger" title="Payment failed">The card on file was declined.</Alert>
    </div>
  );
}
