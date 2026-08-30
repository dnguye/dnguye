import type { CollectionId, CollectionMeta } from "./types";

export const collections: CollectionMeta[] = [
  {
    id: "motion",
    index: "01",
    name: "Motion",
    tagline: "Entrances, scroll effects, and micro-interactions in plain CSS.",
    groups: ["Entrances", "Scroll & flow", "Hover", "Loading", "Text", "Structure", "Reference"],
  },
  {
    id: "foundations",
    index: "02",
    name: "Foundations",
    tagline: "Color schemes, type systems, and the scales that hold a UI together.",
    groups: ["Color", "Type", "Elevation", "Scale"],
  },
  {
    id: "ui",
    index: "03",
    name: "UI",
    tagline: "The everyday components, drawn carefully — from buttons and dialogs to tables and toasts.",
    groups: ["Buttons", "Inputs", "Selection", "Overlays", "Cards", "Data", "Navigation", "Feedback"],
  },
  {
    id: "sections",
    index: "04",
    name: "Sections",
    tagline: "Landing-page building blocks — heroes to footers, plus backgrounds.",
    groups: [
      "Hero",
      "Social proof",
      "Features",
      "Pricing",
      "Call to action",
      "Footer",
      "Backgrounds",
      "Empty states",
    ],
  },
];

export const collectionIds = collections.map((c) => c.id);

export function getCollection(id: string): CollectionMeta | undefined {
  return collections.find((c) => c.id === id);
}

export const refPrefix: Record<CollectionId, string> = {
  motion: "M",
  foundations: "F",
  ui: "U",
  sections: "S",
};
