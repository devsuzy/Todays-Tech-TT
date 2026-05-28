import { BellRing } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlackSubscribeCard } from "@/components/Card/slack-subscribe-card";

export function BellPopover() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Slack 구독"
        className="cursor-pointer size-8 flex items-center justify-center"
      >
        <BellRing className="w-4 h-4 md:w-6 md:h-6" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <SlackSubscribeCard />
      </PopoverContent>
    </Popover>
  );
}
