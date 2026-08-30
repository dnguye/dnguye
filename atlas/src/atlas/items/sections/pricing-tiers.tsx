const TIERS = [
  {
    plan: "Solo",
    price: "$0",
    blurb: "For side projects and tinkering.",
    features: ["1 project", "Community support", "Deploys from main"],
    cta: "Start free",
    highlighted: false,
  },
  {
    plan: "Studio",
    price: "$24",
    blurb: "For small teams shipping every week.",
    features: ["Unlimited projects", "Branch previews", "Priority support", "Audit log"],
    cta: "Choose Studio",
    highlighted: true,
  },
  {
    plan: "Scale",
    price: "$96",
    blurb: "For platform teams with obligations.",
    features: ["Everything in Studio", "SSO & SCIM", "99.95% SLA", "Dedicated region"],
    cta: "Talk to us",
    highlighted: false,
  },
];

export function PricingTiers() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50 px-8 py-16 sm:px-14 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-serif text-3xl text-neutral-900 dark:text-neutral-100">
          Priced for how teams actually grow
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.plan}
              className={`flex flex-col gap-4 rounded-xl border p-6 ${
                tier.highlighted
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tier.plan}</span>
                  {tier.highlighted ? (
                    <span className="rounded-full border border-current px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase opacity-70">
                      Popular
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-3xl">{tier.price}</span>
                  <span className="text-sm opacity-60">/mo</span>
                </div>
                <p className="mt-1.5 text-xs opacity-70">{tier.blurb}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="opacity-50">—</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-auto h-9 rounded-md text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-white text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-white"
                    : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
