import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// The app's one body/UI face — self-hosted via next/font/local since
// Pretendard isn't on Google Fonts. Single variable-weight woff2 covers
// 45–920, so no per-weight file juggling.
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

// Display/headline serif — see globals.css for where it's used (headings,
// tracked section labels) vs. the body face above.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shapeme-ten.vercel.app"),
  title: "SILUA",
  description:
    "SILUA — a self-care diary. Track your workouts, meals, water, and body changes in one place.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SILUA",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f2ed",
  // BottomNav and .app-content both lean on env(safe-area-inset-bottom) to
  // clear the home indicator — that variable only ever resolves to a real
  // value (instead of silently falling back to 0px) once the viewport opts
  // into "cover". Without this, the nav sits just 1rem above the true
  // screen edge on notched/home-indicator iPhones, right where iOS's own
  // bottom-edge swipe gesture competes with taps.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${cormorantGaramond.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
