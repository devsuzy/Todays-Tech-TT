"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const SLACK_CLIENT_ID = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ?? "";

const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=incoming-webhook&redirect_uri=${encodeURIComponent(`${API_BASE}/api/v1/slack/oauth/callback`)}`;

type Status = "idle" | "connected" | "error";

export function SlackSubscribeCard() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slack = params.get("slack");
    if (slack === "connected") setStatus("connected");
    else if (slack === "error") setStatus("error");
  }, []);

  return (
    <div className="border rounded-lg p-6 bg-background space-y-4">
      <div className="flex items-center gap-2">
        <SlackIcon />
        <h2 className="font-semibold text-base">Slack 채널 구독</h2>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        매일 아침 9시, 오늘의 피드를 Slack 채널로 받아보세요.
      </p>

      {status === "connected" ? (
        <p className="text-sm font-medium text-green-600">
          Slack 채널이 연동되었습니다! 🎉
        </p>
      ) : (
        <>
          <a href={slackOAuthUrl} className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Add to Slack"
              height="40"
              width="139"
              src="https://platform.slack-edge.com/img/add_to_slack.png"
            />
          </a>
          {status === "error" && (
            <p className="text-xs text-destructive">
              연동 중 오류가 발생했습니다. 다시 시도해주세요.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            워크스페이스와 채널을 선택하면 자동으로 연동됩니다.
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
