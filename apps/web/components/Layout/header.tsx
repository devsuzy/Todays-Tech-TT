import Link from "next/link";

export function Header() {
  return (
    <header className="shadow-sm bg-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
        <Link href="/archive" className="font-bold text-lg tracking-tight">
          Today&apos;s Tech
        </Link>
      </div>
    </header>
  );
}
