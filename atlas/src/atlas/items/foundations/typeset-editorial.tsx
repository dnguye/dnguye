import { Instrument_Sans, Newsreader } from "next/font/google";

const display = Newsreader({ subsets: ["latin"], style: ["normal", "italic"] });
const body = Instrument_Sans({ subsets: ["latin"] });

/** Editorial: a literary serif for display, a plain-spoken sans for reading. */
export function TypesetEditorial() {
  return (
    <div className="w-full max-w-lg">
      <div className={display.className}>
        <h1 className="text-4xl leading-[1.1] text-neutral-900 dark:text-neutral-100">
          The shape of a sentence
        </h1>
        <p className="mt-1 text-lg text-neutral-500 italic dark:text-neutral-400">
          Newsreader — display, 400 &amp; italic
        </p>
      </div>
      <div className={body.className}>
        <p className="mt-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          Instrument Sans carries the body. Pair a 1.25 modular scale for headings with a
          fixed 14–16px body and let the serif do the talking above the fold.
        </p>
        <div className="mt-4 flex gap-6 font-mono text-[10px] tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
          <span>36 / 28 / 22 display</span>
          <span>16 / 14 body</span>
          <span>1.6 leading</span>
        </div>
      </div>
    </div>
  );
}
