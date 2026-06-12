import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube → Notion Agent",
  description: "유튜브 영상을 AI가 분석해 노션에 자동 저장합니다",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
