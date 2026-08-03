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
    "운동, 식단, 물 섭취와 몸의 변화를 한곳에 기록하는 셀프케어 웹앱",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "쉐잎미",
  },
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
