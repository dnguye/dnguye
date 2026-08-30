import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * Raw source for item files, keyed as "<collection>/<file>" under
 * src/atlas/items/. The demo file that renders IS the file shown and
 * copied — they cannot drift. Read at build time only: every route that
 * calls this is fully static (generateStaticParams, no dynamic APIs).
 */
const ITEMS_DIR = path.join(process.cwd(), "src", "atlas", "items");
const cache = new Map<string, string>();

export function getSource(key: string): string {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  if (!/^[a-z]+\/[\w.-]+\.(tsx|css)$/.test(key)) {
    throw new Error(`Invalid source key: ${key}`);
  }
  const raw = fs.readFileSync(path.join(ITEMS_DIR, key), "utf8");
  cache.set(key, raw);
  return raw;
}
