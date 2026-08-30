import type { Item } from "../../types";

import { EditorialHero } from "./editorial-hero";
import { SplitHero } from "./split-hero";
import { LogoCloud } from "./logo-cloud";
import { FeatureGrid } from "./feature-grid";
import { StickyFeatures } from "./sticky-features";
import { PricingTiers } from "./pricing-tiers";
import { Testimonial } from "./testimonial";
import { CtaBand } from "./cta-band";
import { Footer } from "./footer";
import { GridBackgroundDemo } from "./bg-grid";
import { DotsBackgroundDemo } from "./bg-dots";
import { MeshBackgroundDemo } from "./bg-mesh";
import { EmptyStateDemo } from "./empty-state";

const bleed = { fullBleed: true };

export const items: Item[] = [
  {
    slug: "editorial-hero",
    collection: "sections",
    group: "Hero",
    name: "Editorial hero",
    summary:
      "A left-aligned serif hero with a kicker, an italic turn, and exactly one primary action. Copy-first, no artwork needed.",
    tags: ["hero", "landing", "serif"],
    kind: "component",
    stage: { ...bleed, height: 480 },
    files: [{ path: "components/sections/hero.tsx", lang: "tsx", source: "sections/editorial-hero.tsx" }],
    Preview: EditorialHero,
    notes: {
      integration: ["Replace the copy with your product's one-sentence offer; keep a single primary CTA."],
    },
  },
  {
    slug: "split-hero",
    collection: "sections",
    group: "Hero",
    name: "Split hero with terminal",
    summary:
      "Copy on the left, a product artifact on the right — here a terminal card with a copyable install command.",
    tags: ["hero", "landing", "developer"],
    kind: "component",
    stage: { ...bleed, height: 520 },
    files: [{ path: "components/sections/split-hero.tsx", lang: "tsx", source: "sections/split-hero.tsx" }],
    Preview: SplitHero,
  },
  {
    slug: "logo-cloud",
    collection: "sections",
    group: "Social proof",
    name: "Logo cloud",
    summary:
      "Wordmark-style client logos in a muted row that sharpen on hover. Swap the strings for SVG logos when you have them.",
    tags: ["social-proof", "landing"],
    kind: "component",
    stage: { ...bleed, height: 280 },
    files: [{ path: "components/sections/logo-cloud.tsx", lang: "tsx", source: "sections/logo-cloud.tsx" }],
    Preview: LogoCloud,
  },
  {
    slug: "testimonial",
    collection: "sections",
    group: "Social proof",
    name: "Testimonial",
    summary:
      "One strong quote set in serif at reading size — a single voice beats a wall of five-star cards.",
    tags: ["social-proof", "landing", "quote"],
    kind: "component",
    stage: { ...bleed, height: 460 },
    files: [{ path: "components/sections/testimonial.tsx", lang: "tsx", source: "sections/testimonial.tsx" }],
    Preview: Testimonial,
  },
  {
    slug: "feature-grid",
    collection: "sections",
    group: "Features",
    name: "Feature grid",
    summary:
      "Six numbered features in a hairline-ruled grid — the 1px gaps come from the grid gap on a line-colored background.",
    tags: ["features", "landing", "grid"],
    kind: "component",
    stage: { ...bleed, height: 560 },
    files: [{ path: "components/sections/feature-grid.tsx", lang: "tsx", source: "sections/feature-grid.tsx" }],
    Preview: FeatureGrid,
  },
  {
    slug: "sticky-features",
    collection: "sections",
    group: "Features",
    name: "Sticky walkthrough",
    summary:
      "The heading column pins while the steps scroll past — a walkthrough that keeps context on screen. CSS position: sticky only.",
    tags: ["features", "landing", "scroll"],
    kind: "component",
    stage: { ...bleed, height: 560 },
    files: [{ path: "components/sections/sticky-features.tsx", lang: "tsx", source: "sections/sticky-features.tsx" }],
    Preview: StickyFeatures,
  },
  {
    slug: "pricing-tiers",
    collection: "sections",
    group: "Pricing",
    name: "Three-tier pricing",
    summary:
      "Solo, Studio, Scale — the middle tier inverts to carry the eye. Features read as em-dash lists, one action per card.",
    tags: ["pricing", "landing"],
    kind: "component",
    stage: { ...bleed, height: 640 },
    files: [{ path: "components/sections/pricing.tsx", lang: "tsx", source: "sections/pricing-tiers.tsx" }],
    Preview: PricingTiers,
  },
  {
    slug: "cta-band",
    collection: "sections",
    group: "Call to action",
    name: "CTA band",
    summary:
      "A full-width inverted band that repeats the primary action near the end of the page — short, high-contrast, no new arguments.",
    tags: ["cta", "landing"],
    kind: "component",
    stage: { ...bleed, height: 300 },
    files: [{ path: "components/sections/cta-band.tsx", lang: "tsx", source: "sections/cta-band.tsx" }],
    Preview: CtaBand,
  },
  {
    slug: "footer",
    collection: "sections",
    group: "Footer",
    name: "Footer",
    summary:
      "Four link columns, a short brand statement, and a status line — every list is a labelled nav landmark.",
    tags: ["footer", "landing"],
    kind: "component",
    stage: { ...bleed, height: 480 },
    files: [{ path: "components/sections/footer.tsx", lang: "tsx", source: "sections/footer.tsx" }],
    Preview: Footer,
  },
  {
    slug: "grid-background",
    collection: "sections",
    group: "Backgrounds",
    name: "Blueprint grid",
    summary:
      "A 32px line grid faded out radially so content stays legible at the center. Two CSS gradients, no images.",
    tags: ["background", "css-only"],
    kind: "component",
    stage: { ...bleed, height: 360 },
    files: [{ path: "components/backgrounds/grid.tsx", lang: "tsx", source: "sections/bg-grid.tsx" }],
    Preview: GridBackgroundDemo,
  },
  {
    slug: "dots-background",
    collection: "sections",
    group: "Backgrounds",
    name: "Perforated field",
    summary:
      "A 20px dot lattice with a radial mask — quieter than the grid, good behind heroes with dense copy.",
    tags: ["background", "css-only"],
    kind: "component",
    stage: { ...bleed, height: 360 },
    files: [{ path: "components/backgrounds/dots.tsx", lang: "tsx", source: "sections/bg-dots.tsx" }],
    Preview: DotsBackgroundDemo,
  },
  {
    slug: "mesh-background",
    collection: "sections",
    group: "Backgrounds",
    name: "Grain and gradient",
    summary:
      "Three soft radial washes under an SVG-noise overlay — atmosphere without banding, in pure CSS and a data URI.",
    tags: ["background", "gradient", "css-only"],
    kind: "component",
    stage: { ...bleed, height: 360 },
    files: [{ path: "components/backgrounds/mesh.tsx", lang: "tsx", source: "sections/bg-mesh.tsx" }],
    Preview: MeshBackgroundDemo,
  },
  {
    slug: "empty-state",
    collection: "sections",
    group: "Empty states",
    name: "Empty state",
    summary:
      "A dashed frame, one line of reassurance, and the next step as a real button — the moment a product earns trust.",
    tags: ["empty-state", "onboarding"],
    kind: "component",
    stage: { height: 420 },
    files: [{ path: "components/empty-state.tsx", lang: "tsx", source: "sections/empty-state.tsx" }],
    Preview: EmptyStateDemo,
  },
];
