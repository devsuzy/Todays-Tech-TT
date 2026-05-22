"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareButton() {
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast("URL이 클립보드에 복사되었습니다.", { position: "bottom-center" });
  };

  return (
    <Button 
      variant="ghost"
      size="icon"
      onClick={handleShare}
      aria-label="공유하기"
      className="rounded-full cursor-pointer border border-muted-foreground/50 focus-visible:border-ring focus-visible:ring-ring/50"
      >
      <Share2 className="w-5 h-5 text-muted-foreground/70 hover:text-muted-foreground" />
    </Button>
  );
}
