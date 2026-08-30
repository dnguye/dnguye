import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
      <div className="font-mono text-[11px] tracking-[0.1em] text-faint uppercase">404</div>
      <h1 className="font-serif text-3xl">Not in the library.</h1>
      <Link href="/" className="font-mono text-xs text-accent hover:opacity-80">
        Back to contents →
      </Link>
    </div>
  );
}
