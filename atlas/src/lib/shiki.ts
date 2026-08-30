import "server-only";

import { codeToHtml } from "shiki";

/** Build-time dual-theme highlighting; zero client JS. */
export async function highlight(code: string, lang: "tsx" | "css" | "bash" | "json") {
  return codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    defaultColor: false,
  });
}
