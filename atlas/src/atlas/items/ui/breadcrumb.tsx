export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-2">
              {last || !crumb.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500"}
                >
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.href}
                  className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {crumb.label}
                </a>
              )}
              {!last ? <span className="text-neutral-300 dark:text-neutral-600">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BreadcrumbDemo() {
  return (
    <Breadcrumb
      trail={[
        { label: "Workspaces", href: "#" },
        { label: "Acme Inc", href: "#" },
        { label: "Settings", href: "#" },
        { label: "Billing" },
      ]}
    />
  );
}
