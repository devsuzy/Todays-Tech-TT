"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <Button variant="outline" className="h-10 gap-1.5 cursor-pointer" onClick={() => router.back()}>
      <ChevronLeft className="w-4 h-4" />
      뒤로가기
    </Button>
  );
}
