import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

/** Grotesk: a boxy geometric display with a mono undertone — technical products. */
export function TypesetGrotesk() {
  return (
    <div className="w-full max-w-lg">
      <div className={display.className}>
        <h1 className="text-4xl leading-[1.05] font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Precision by default
        </h1>
        <p className="mt-1 text-lg text-neutral-500 dark:text-neutral-400">
          Space Grotesk — display, 500
        </p>
      </div>
      <div className={mono.className}>
        <p className="mt-5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
          IBM Plex Mono for body and data alike. Works when the interface itself is the
          product: dashboards, terminals, developer tools.
        </p>
        <div className="mt-4 flex gap-6 text-[10px] tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
          <span>40 / 24 display</span>
          <span>13 mono body</span>
          <span>tabular numerals</span>
        </div>
      </div>
    </div>
  );
}
