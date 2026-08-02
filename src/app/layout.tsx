import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-en",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "쉐잎미 ShapeMe",
  description:
    "100일 운동 프로그램을 수행하고 눈바디 변화를 기록하는 AI 퍼스널 트레이닝 웹앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${instrumentSans.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
