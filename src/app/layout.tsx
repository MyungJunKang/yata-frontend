import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BottomNav } from "@/components/ui/bottom-nav";
import { JotaiProvider } from "@/providers/jotai-provider";
import { QueryProvider } from "@/providers/query-provider";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yata",
  description: "Yata frontend",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={pretendard.variable}>
        <JotaiProvider>
          <QueryProvider>
            <main className="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
              {children}
            </main>
            {/* 전역 1회 마운트 — path 별 가시성 토글만 일어나 nav remount 가 없다. */}
            <BottomNav />
          </QueryProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
