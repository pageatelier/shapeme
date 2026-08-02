import { AppSplash } from "@/components/AppSplash";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-en-loaded",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-logo-loaded",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "ShapeMe",
  title: "ShapeMe",
  description:
    "운동, 식단, 물 섭취와 몸의 변화를 한곳에 기록하는 셀프케어 웹앱",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "ShapeMe",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf7f3",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<html
  lang="ko"
  className={`${instrumentSans.variable} ${cormorantGaramond.variable} antialiased`}
  style={{ backgroundColor: "#faf7f3" }}
>
<body
  className="min-h-full"
  style={{ backgroundColor: "#faf7f3" }}
>
  <AppSplash />
  {children}
</body>
</html>
  );
}
