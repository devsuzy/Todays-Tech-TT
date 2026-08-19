import { permanentRedirect } from "next/navigation";

export default function Home() {
  // 308 영구 리다이렉트 — 검색엔진이 /archive 를 대표 URL로 인식하도록 한다
  permanentRedirect("/archive");
}
