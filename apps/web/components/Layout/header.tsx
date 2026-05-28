import Link from "next/link";
import { SearchModal } from "@/components/Modal/search-modal";
import { BellPopover } from "@/components/Popover/bell-popover";

export function Header() {
  return (
    <header className="shadow-sm bg-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/archive" className="font-bold text-lg tracking-tight">
          Today&apos;s Tech
        </Link>
        <div className="flex items-center gap-1 md:gap-3">
          <BellPopover />
          <SearchModal />
        </div>
      </div>
    </header>
  );
}
