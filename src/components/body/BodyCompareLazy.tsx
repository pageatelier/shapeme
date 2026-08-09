"use client";

import dynamic from "next/dynamic";
import { bodyCopy } from "@/lib/copy/body";

// `ssr: false` needs a Client Component boundary in this Next.js version —
// this file exists only to provide that boundary for the Body page (a
// Server Component). Its own chunk instead of the page's initial bundle.
export const BodyCompare = dynamic(() => import("./BodyCompare").then((m) => m.BodyCompare), {
  ssr: false,
  loading: () => (
    <div className="surface-card animate-pulse p-5 text-center text-[13px] text-text-muted">{bodyCopy.loading}</div>
  ),
});
