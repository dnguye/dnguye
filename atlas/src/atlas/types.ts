import type { ComponentType } from "react";

export type CollectionId = "motion" | "foundations" | "ui" | "sections";

export type ItemKind = "component" | "palette" | "typeset" | "scale" | "reference";

export type ItemFile = {
  /** Suggested destination path in the consumer's project (shown as the tab label). */
  path: string;
  lang: "tsx" | "css" | "bash" | "json";
  /** Key into the raw-source registry: `<collection>/<file>` under src/atlas/items/. */
  source: string;
};

export type Item = {
  slug: string;
  collection: CollectionId;
  group: string;
  name: string;
  summary: string;
  tags: string[];
  kind: ItemKind;
  stage?: {
    /** Landing-page sections render edge-to-edge and scaled-down in tiles. */
    fullBleed?: boolean;
    /** Stage height on the detail page (px). Default 420. */
    height?: number;
  };
  /** npm dependencies beyond react/tailwind. Almost always empty. */
  deps?: string[];
  /** CSS custom properties the copied code relies on. */
  tokens?: string[];
  files: ItemFile[];
  Preview: ComponentType;
  /** Optional compact tile rendering, for demos that need viewport room. */
  Thumb?: ComponentType;
  notes?: {
    integration?: string[];
    a11y?: string[];
  };
};

export type CollectionMeta = {
  id: CollectionId;
  index: string; // "01"
  name: string;
  tagline: string;
  groups: string[];
};

export type SearchEntry = {
  collection: CollectionId;
  collectionName: string;
  slug: string;
  name: string;
  group: string;
  summary: string;
  tags: string[];
  ref: string; // e.g. "M-01"
};
