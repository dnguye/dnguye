const FEATURES = [
  { title: "Branch previews", body: "Every pull request gets a full environment with seeded data." },
  { title: "Instant rollback", body: "Any deploy can be reverted in one command, state included." },
  { title: "Audit by default", body: "Every change is signed, attributed, and queryable." },
  { title: "Zero-config SSO", body: "SAML and OIDC work out of the box on every plan." },
  { title: "Usage-fair pricing", body: "Pay for what runs, not for the seats watching it." },
  { title: "Humane on-call", body: "Alerts route by expertise and time zone, not by luck." },
];

export function FeatureGrid() {
  return (
    <section className="border-b border-neutral-200 bg-white px-8 py-16 sm:px-14 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl">
        <h2 className="max-w-md font-serif text-3xl leading-tight text-neutral-900 dark:text-neutral-100">
          Everything a deploy needs, nothing it doesn&apos;t
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-neutral-800 dark:bg-neutral-800">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className="bg-white p-6 dark:bg-neutral-950">
              <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {feature.title}
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
