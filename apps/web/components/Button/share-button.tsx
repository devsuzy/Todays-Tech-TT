"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "lucide-react";

export function ShareButton() {
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast("URL이 클립보드에 복사되었습니다.", {
      position: "bottom-center",
      icon: <Link width={16} height={16} />
    });
  };

  return (
    <Button 
      variant="ghost"
      size="icon"
      onClick={handleShare}
      aria-label="공유하기"
      className="rounded-full cursor-pointer border border-muted-foreground/70 md:border-none focus-visible:border-ring focus-visible:ring-ring/50"
      >
      <Share2 className="text-muted-foreground hover:text-muted-foreground" />
    </Button>
  );
}
