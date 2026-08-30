export function PricingCard({
  plan,
  price,
  blurb,
  features,
  highlighted = false,
}: {
  plan: string;
  price: string;
  blurb: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`flex w-64 flex-col gap-4 rounded-xl border p-6 ${
        highlighted
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
      }`}
    >
      <div>
        <div className="text-sm font-medium">{plan}</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-serif text-3xl">{price}</span>
          <span className={highlighted ? "text-sm opacity-60" : "text-sm text-neutral-500 dark:text-neutral-400"}>
            /mo
          </span>
        </div>
        <p className={`mt-1.5 text-xs leading-relaxed ${highlighted ? "opacity-70" : "text-neutral-500 dark:text-neutral-400"}`}>
          {blurb}
        </p>
      </div>
      <ul className="flex flex-col gap-1.5 text-[13px]">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className={highlighted ? "opacity-60" : "text-neutral-400"}>—</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`mt-auto h-9 rounded-md text-sm font-medium transition-colors ${
          highlighted
            ? "bg-white text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-700"
            : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        }`}
      >
        Choose {plan}
      </button>
    </div>
  );
}

export function PricingCardDemo() {
  return (
    <PricingCard
      plan="Studio"
      price="$24"
      blurb="For small teams shipping every week."
      features={["Unlimited projects", "Shared component library", "Priority support"]}
      highlighted
    />
  );
}
