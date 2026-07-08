import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./src/providers/AuthProvider";
import Header from "./src/components/Header";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
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
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/quiple/x12y12pxMaruMinyaHangul@main/fonts/x12y12pxMaruMinyaHangul.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`flex ${spaceMono.variable} antialiased flex-col min-h-screen bg-[#F5EEE6]`}>
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
