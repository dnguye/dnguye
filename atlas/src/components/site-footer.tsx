import { site } from "@/atlas/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex items-center justify-between border-t border-line px-6 py-5 sm:px-12">
      <div className="font-mono text-[10px] tracking-[0.08em] text-faint uppercase">
        {site.name} · built for hand-off
      </div>
      <div className="font-mono text-[10px] tracking-[0.08em] text-faint uppercase">
        No runtime dependencies
      </div>
    </footer>
  );
}
