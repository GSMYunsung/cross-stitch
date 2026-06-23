import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./src/providers/AuthProvider";
import Header from "./src/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrossStitch — Turn commits into pixel art",
  description:
    "GitHub 커밋을 기반으로 나만의 십자수 픽셀 아트를 만들고 README에 삽입하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`flex ${geistSans.variable} ${geistMono.variable} antialiased flex-col min-h-screen bg-[#0d0d12] text-[#e2e8f0]`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
