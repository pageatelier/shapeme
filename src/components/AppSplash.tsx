"use client";

import { useEffect, useState } from "react";

export function AppSplash() {
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setIsClosing(true);
    }, 1200);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1550);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-[#faf7f3] transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="-translate-y-4 text-center">
        <div
          className="text-[52px] font-semibold leading-none tracking-[-0.035em] text-[#563e3a]"
          style={{
            fontFamily: "var(--font-logo-loaded), serif",
          }}
        >
          ShapeMe
        </div>

        <span className="mx-auto mt-6 block h-1.5 w-1.5 animate-pulse rounded-full bg-[#e7a0a7]" />
      </div>
    </div>
  );
}