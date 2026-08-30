import { Public_Sans, Source_Serif_4 } from "next/font/google";

const serif = Source_Serif_4({ subsets: ["latin"] });
const sans = Public_Sans({ subsets: ["latin"] });

/** Humanist: warm, institutional, highly readable — documentation and long form. */
export function TypesetHumanist() {
  return (
    <div className="w-full max-w-lg">
      <div className={serif.className}>
        <h1 className="text-4xl leading-[1.12] text-neutral-900 dark:text-neutral-100">
          Built to be read twice
        </h1>
        <p className="mt-1 text-lg text-neutral-500 dark:text-neutral-400">
          Source Serif 4 — display &amp; long form
        </p>
      </div>
      <div className={sans.className}>
        <p className="mt-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          Public Sans handles UI chrome, labels, and captions. The pairing reads calmly at
          small sizes and holds up in dense documentation layouts.
        </p>
        <div className="mt-4 flex gap-6 font-mono text-[10px] tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
          <span>34 / 26 / 20 display</span>
          <span>14 body</span>
          <span>1.65 leading</span>
        </div>
      </div>
    </div>
  );
}
