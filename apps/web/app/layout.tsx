import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "TT - Today's Tech",
  description: "국내 주요 기술 블로그를 매일 자동으로 크롤링해 AI가 요약·발행하는 테크 뉴스레터 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
