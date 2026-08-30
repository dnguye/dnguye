import type { Item } from "../../types";

import {
  InkAndEmberPreview,
  MidnightPreview,
  PorcelainPreview,
  VerdantPreview,
} from "./palettes";
import { TypesetEditorial } from "./typeset-editorial";
import { TypesetGrotesk } from "./typeset-grotesk";
import { TypesetHumanist } from "./typeset-humanist";
import { ElevationRamp } from "./elevation";
import { RadiusScale } from "./radius";
import { SpacingScale } from "./spacing";

const paletteTokens = [
  "--color-canvas",
  "--color-surface",
  "--color-line",
  "--color-ink",
  "--color-muted",
  "--color-accent",
  "--color-on-accent",
];

const paletteNotes = {
  integration: [
    "Import the CSS after tailwindcss in globals.css; the @theme block exposes bg-canvas, text-ink, border-line, bg-accent as utilities.",
    "Toggle dark mode by putting the .dark class on <html> (e.g. via next-themes with attribute=\"class\").",
  ],
  a11y: ["Body text (ink on canvas) stays above 7:1 in both modes; accent-on-surface above 4.5:1."],
};

export const items: Item[] = [
  {
    slug: "porcelain",
    collection: "foundations",
    group: "Color",
    name: "Porcelain",
    summary:
      "Cool, quiet neutrals with an indigo accent — a light-first scheme for calm productivity tools. Ships as Tailwind v4 theme tokens with a matched dark mode.",
    tags: ["palette", "light-first", "cool"],
    kind: "palette",
    tokens: paletteTokens,
    files: [{ path: "styles/theme.css", lang: "css", source: "foundations/porcelain.css" }],
    Preview: PorcelainPreview,
    notes: paletteNotes,
  },
  {
    slug: "ink-and-ember",
    collection: "foundations",
    group: "Color",
    name: "Ink & Ember",
    summary:
      "Warm paper and near-black with a burnt-orange accent — the scheme this site runs on. Editorial, low-glare, comfortable for long reading.",
    tags: ["palette", "dark-first", "warm"],
    kind: "palette",
    tokens: paletteTokens,
    files: [{ path: "styles/theme.css", lang: "css", source: "foundations/ink-and-ember.css" }],
    Preview: InkAndEmberPreview,
    notes: paletteNotes,
  },
  {
    slug: "verdant",
    collection: "foundations",
    group: "Color",
    name: "Verdant",
    summary:
      "Green-tinted neutrals with a forest accent — grounded and organic without leaning novelty. Both modes keep chroma low outside the accent.",
    tags: ["palette", "green", "organic"],
    kind: "palette",
    tokens: paletteTokens,
    files: [{ path: "styles/theme.css", lang: "css", source: "foundations/verdant.css" }],
    Preview: VerdantPreview,
    notes: paletteNotes,
  },
  {
    slug: "midnight",
    collection: "foundations",
    group: "Color",
    name: "Midnight",
    summary:
      "Blue-black dark-first with a clear blue accent — the familiar developer-tool register, tuned so surfaces separate without borders shouting.",
    tags: ["palette", "dark-first", "cool"],
    kind: "palette",
    tokens: paletteTokens,
    files: [{ path: "styles/theme.css", lang: "css", source: "foundations/midnight.css" }],
    Preview: MidnightPreview,
    notes: paletteNotes,
  },
  {
    slug: "typeset-editorial",
    collection: "foundations",
    group: "Type",
    name: "Editorial typeset",
    summary:
      "Newsreader for display, Instrument Sans for reading — a literary pairing for content-forward products. Self-hosted via next/font.",
    tags: ["typography", "serif", "pairing"],
    kind: "typeset",
    stage: { height: 360 },
    files: [
      { path: "components/typeset.tsx", lang: "tsx", source: "foundations/typeset-editorial.tsx" },
    ],
    Preview: TypesetEditorial,
    notes: {
      integration: [
        "next/font self-hosts both faces — no external font requests at runtime.",
        "Move the font constants to your root layout and pass classes down via CSS variables for app-wide use.",
      ],
    },
  },
  {
    slug: "typeset-grotesk",
    collection: "foundations",
    group: "Type",
    name: "Grotesk typeset",
    summary:
      "Space Grotesk display over an IBM Plex Mono body — boxy and technical, for products where the interface is the product.",
    tags: ["typography", "mono", "pairing"],
    kind: "typeset",
    stage: { height: 360 },
    files: [
      { path: "components/typeset.tsx", lang: "tsx", source: "foundations/typeset-grotesk.tsx" },
    ],
    Preview: TypesetGrotesk,
  },
  {
    slug: "typeset-humanist",
    collection: "foundations",
    group: "Type",
    name: "Humanist typeset",
    summary:
      "Source Serif 4 with Public Sans — warm, institutional, highly readable. Built for documentation and long-form product writing.",
    tags: ["typography", "serif", "pairing"],
    kind: "typeset",
    stage: { height: 360 },
    files: [
      { path: "components/typeset.tsx", lang: "tsx", source: "foundations/typeset-humanist.tsx" },
    ],
    Preview: TypesetHumanist,
  },
  {
    slug: "elevation-ramp",
    collection: "foundations",
    group: "Elevation",
    name: "Elevation ramp",
    summary:
      "Four shadow steps — raised, card, overlay, modal — are enough for a whole product. Ships as Tailwind shadow tokens.",
    tags: ["shadow", "tokens"],
    kind: "scale",
    files: [
      { path: "components/elevation-ramp.tsx", lang: "tsx", source: "foundations/elevation.tsx" },
      { path: "styles/elevation.css", lang: "css", source: "foundations/elevation.css" },
    ],
    Preview: ElevationRamp,
    notes: {
      integration: [
        "On dark surfaces, prefer a lighter surface color per step over a heavier shadow — shadows read weaker on dark.",
      ],
    },
  },
  {
    slug: "radius-scale",
    collection: "foundations",
    group: "Scale",
    name: "Radius scale",
    summary:
      "One base radius, four derived steps. Change --radius once and the whole product re-rounds consistently.",
    tags: ["radius", "tokens"],
    kind: "scale",
    files: [
      { path: "components/radius-scale.tsx", lang: "tsx", source: "foundations/radius.tsx" },
      { path: "styles/radius.css", lang: "css", source: "foundations/radius.css" },
    ],
    Preview: RadiusScale,
  },
  {
    slug: "spacing-scale",
    collection: "foundations",
    group: "Scale",
    name: "Spacing rhythm",
    summary:
      "A 4px base with eight sanctioned steps and a rule of thumb for each band — inside controls, between siblings, groups, sections.",
    tags: ["spacing", "tokens"],
    kind: "scale",
    files: [
      { path: "components/spacing-scale.tsx", lang: "tsx", source: "foundations/spacing.tsx" },
      { path: "styles/spacing.css", lang: "css", source: "foundations/spacing.css" },
    ],
    Preview: SpacingScale,
  },
];
