import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-en",
  subsets: ["latin"],
  display: "swap",
});

// Wordmark-only serif — scoped to BrandLogo (src/components/BrandLogo.tsx),
// never applied app-wide. Everything else keeps --font-en/--font-ko.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shapeme-ten.vercel.app"),
  title: "쉐잎미 ShapeMe",
  description:
    "ShapeMe — A self-care diary. Every moment shapes me. 운동, 식단, 물 섭취와 몸의 변화를 한곳에 기록하는 셀프케어 웹앱",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "쉐잎미",
  },
  twitter: {
    card: "summary_large_image",
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
    <html lang="ko" className={`${instrumentSans.variable} ${cormorantGaramond.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
