"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type Status = "idle" | "loading" | "success" | "error";

export function SlackSubscribeCard() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubscribe() {
    if (!webhookUrl.startsWith("https://hooks.slack.com/services/")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/v1/slack/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-background space-y-4">
      <div className="flex items-center gap-2">
        <SlackIcon />
        <h2 className="font-semibold text-base">Slack 채널 구독</h2>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        매일 아침 9시, 오늘의 피드를 Slack 채널로 받아보세요.
      </p>

      {status === "success" ? (
        <p className="text-sm font-medium text-green-600">
          구독이 완료되었습니다!
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={webhookUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setWebhookUrl(e.target.value);
                setStatus("idle");
              }}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            />
            <Button onClick={handleSubscribe} disabled={status === "loading"}>
              {status === "loading" ? "처리 중..." : "구독"}
            </Button>
          </div>
          {status === "error" && (
            <p className="text-xs text-destructive">
              올바른 Slack Webhook URL을 입력해주세요.
              (https://hooks.slack.com/services/...)
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Slack 채널의 Incoming Webhooks 앱에서 URL을 복사해 붙여넣으세요.
          </p>
        </>
      )}
    </div>
  );
}

function SlackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 2447.6 2452.5"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g clipRule="evenodd" fillRule="evenodd">
        <path
          d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2.1 135.3 109.6 245.1 244.9 245.2h652.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.2"
          fill="#36c5f0"
        />
        <path
          d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3"
          fill="#2eb67d"
        />
        <path
          d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-652.5c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.5 245.2 244.8 245.2"
          fill="#ecb22e"
        />
        <path
          d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1"
          fill="#e01e5a"
        />
      </g>
    </svg>
  );
}
