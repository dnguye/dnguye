import type { Metadata } from "next";

import { site } from "@/atlas/site";
import { searchIndex } from "@/atlas/registry";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";

import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.kicker}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} font-sans`}>
        <Providers>
          <div className="mx-auto flex min-h-svh w-full max-w-[1440px] flex-col border-line xl:border-x">
            <Header index={searchIndex()} />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
