import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
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
            <main className="mx-auto w-full max-w-screen-sm px-4 sm:px-6 md:max-w-screen-md lg:max-w-screen-lg lg:px-8">
              {children}
            </main>
          </QueryProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
