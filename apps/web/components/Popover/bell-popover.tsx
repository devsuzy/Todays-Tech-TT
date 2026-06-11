"use client";

import { useState, useEffect } from "react";
import { BellRing } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlackSubscribeCard } from "@/components/Card/slack-subscribe-card";

export function BellPopover() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slack = params.get("slack");
    if (slack === "connected" || slack === "error") setOpen(true);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Slack 구독"
        className="cursor-pointer size-8 flex items-center justify-center"
      >
        <BellRing className="w-5 h-5 md:w-6 md:h-6" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <SlackSubscribeCard />
      </PopoverContent>
    </Popover>
  );
}
