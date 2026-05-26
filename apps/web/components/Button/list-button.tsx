import Link from "next/link";
import { LayoutList } from "lucide-react";

export function ListButton() {
  return (
    <Link
      href="/"
      className="inline-flex h-10 items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
    >
    <LayoutList className="w-4 h-4" />
      목록보기
    </Link>
  )
}