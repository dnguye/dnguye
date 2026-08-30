import type { Item } from "../../types";

import { FadeRiseDemo } from "./fade-rise";
import { ScaleInBlurDemo } from "./scale-in-blur";
import { MarqueeDemo } from "./marquee-ticker";
import { ScrollProgressDemo } from "./scroll-progress";
import { RevealOnScrollDemo } from "./reveal-on-scroll";
import { MagneticButtonDemo } from "./magnetic-button";
import { TiltCardDemo } from "./tilt-card";
import { SkeletonDemo } from "./shimmer-skeleton";
import { SpinnerTrioDemo } from "./spinner-trio";
import { TextScrambleDemo } from "./text-scramble";
import { AccordionReveal } from "./accordion-reveal";
import { RevealOnScrollThumb, ScrollProgressThumb } from "./thumbs";
import { EasingCurves } from "./easing-curves";

export const items: Item[] = [
  {
    slug: "fade-rise-stagger",
    collection: "motion",
    group: "Entrances",
    name: "Fade rise stagger",
    summary:
      "Children enter with a soft rise and fade, offset by a per-item delay. Pure CSS keyframes — no animation library.",
    tags: ["css-only", "entrance", "stagger"],
    kind: "component",
    files: [{ path: "components/fade-rise.tsx", lang: "tsx", source: "motion/fade-rise.tsx" }],
    Preview: FadeRiseDemo,
    notes: {
      integration: [
        "Wrap the elements that should enter together in <FadeRise> — each direct child gets its own delay.",
        "Tune the `stagger` prop (ms between children); 60–120ms reads best.",
      ],
      a11y: ["Content is present and readable before the animation finishes (opacity only)."],
    },
  },
  {
    slug: "scale-in-blur",
    collection: "motion",
    group: "Entrances",
    name: "Scale in with blur",
    summary:
      "A single element settles into focus — scale, opacity, and blur resolve together. Good for dialogs and feature cards.",
    tags: ["css-only", "entrance"],
    kind: "component",
    files: [
      { path: "components/scale-in-blur.tsx", lang: "tsx", source: "motion/scale-in-blur.tsx" },
    ],
    Preview: ScaleInBlurDemo,
  },
  {
    slug: "marquee-ticker",
    collection: "motion",
    group: "Scroll & flow",
    name: "Marquee ticker",
    summary:
      "An infinite horizontal loop built from two copies of the track. Pauses on hover; stops entirely under reduced motion.",
    tags: ["css-only", "loop", "logo-cloud"],
    kind: "component",
    files: [
      { path: "components/marquee.tsx", lang: "tsx", source: "motion/marquee-ticker.tsx" },
    ],
    Preview: MarqueeDemo,
    notes: {
      integration: [
        "Give the track enough children to overflow its container, or the loop will show a gap.",
        "The second copy is aria-hidden so screen readers hear the list once.",
      ],
    },
  },
  {
    slug: "scroll-progress",
    collection: "motion",
    group: "Scroll & flow",
    name: "Scroll progress rail",
    summary:
      "A fixed 2px reading-progress bar scaled on the X axis — transform-only, so scrolling never triggers layout.",
    tags: ["scroll", "reading"],
    kind: "component",
    stage: { height: 360 },
    files: [
      { path: "components/scroll-progress.tsx", lang: "tsx", source: "motion/scroll-progress.tsx" },
    ],
    Preview: ScrollProgressDemo,
    Thumb: ScrollProgressThumb,
  },
  {
    slug: "reveal-on-scroll",
    collection: "motion",
    group: "Scroll & flow",
    name: "Reveal on scroll",
    summary:
      "IntersectionObserver reveal that fires once at 25% visibility. Reduced motion shows everything immediately.",
    tags: ["scroll", "entrance"],
    kind: "component",
    stage: { height: 380 },
    files: [
      { path: "components/reveal-on-scroll.tsx", lang: "tsx", source: "motion/reveal-on-scroll.tsx" },
    ],
    Preview: RevealOnScrollDemo,
    Thumb: RevealOnScrollThumb,
  },
  {
    slug: "magnetic-button",
    collection: "motion",
    group: "Hover",
    name: "Magnetic button",
    summary:
      "The button leans toward the pointer and springs back on leave. A strength prop scales the pull.",
    tags: ["hover", "pointer", "button"],
    kind: "component",
    files: [
      { path: "components/magnetic-button.tsx", lang: "tsx", source: "motion/magnetic-button.tsx" },
    ],
    Preview: MagneticButtonDemo,
    notes: {
      a11y: ["Keyboard activation is unaffected — the pull is pointer-only."],
    },
  },
  {
    slug: "pointer-tilt-card",
    collection: "motion",
    group: "Hover",
    name: "Pointer tilt card",
    summary:
      "A card that tilts up to 10° toward the pointer in 3D, settling flat on leave. Transform-only.",
    tags: ["hover", "pointer", "card"],
    kind: "component",
    files: [{ path: "components/tilt-card.tsx", lang: "tsx", source: "motion/tilt-card.tsx" }],
    Preview: TiltCardDemo,
  },
  {
    slug: "shimmer-skeleton",
    collection: "motion",
    group: "Loading",
    name: "Shimmer skeleton",
    summary:
      "Loading placeholders with a diagonal light sweep. One primitive composes into avatars, lines, and blocks.",
    tags: ["css-only", "loading", "skeleton"],
    kind: "component",
    files: [
      { path: "components/skeleton.tsx", lang: "tsx", source: "motion/shimmer-skeleton.tsx" },
    ],
    Preview: SkeletonDemo,
  },
  {
    slug: "spinner-trio",
    collection: "motion",
    group: "Loading",
    name: "Spinner trio",
    summary:
      "Three small loading indicators — ring, pulsing dots, sound bars — each a few lines of CSS with a role of status.",
    tags: ["css-only", "loading"],
    kind: "component",
    files: [
      { path: "components/spinners.tsx", lang: "tsx", source: "motion/spinner-trio.tsx" },
    ],
    Preview: SpinnerTrioDemo,
  },
  {
    slug: "text-scramble",
    collection: "motion",
    group: "Text",
    name: "Text scramble",
    summary:
      "Cycles through phrases by resolving glyph noise left to right. Reduced motion swaps text instantly.",
    tags: ["text", "loop"],
    kind: "component",
    files: [
      { path: "components/text-scramble.tsx", lang: "tsx", source: "motion/text-scramble.tsx" },
    ],
    Preview: TextScrambleDemo,
    notes: {
      a11y: ["The span is aria-live=polite, so assistive tech announces settled phrases only."],
    },
  },
  {
    slug: "accordion-reveal",
    collection: "motion",
    group: "Structure",
    name: "Accordion height transition",
    summary:
      "Animates grid-template-rows from 0fr to 1fr — a true transition to intrinsic height, no max-height guesses.",
    tags: ["css-only", "disclosure"],
    kind: "component",
    files: [
      { path: "components/accordion-reveal.tsx", lang: "tsx", source: "motion/accordion-reveal.tsx" },
    ],
    Preview: AccordionReveal,
    notes: {
      a11y: ["Triggers carry aria-expanded; content stays in the accessibility tree."],
    },
  },
  {
    slug: "easing-curves",
    collection: "motion",
    group: "Reference",
    name: "Easing curve reference",
    summary:
      "Five named cubic-bezier curves with live previews — click a row to run the ball and copy the value.",
    tags: ["reference", "easing"],
    kind: "reference",
    files: [
      { path: "components/easing-curves.tsx", lang: "tsx", source: "motion/easing-curves.tsx" },
    ],
    Preview: EasingCurves,
  },
];
