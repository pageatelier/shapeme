"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function kstIsoDate(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function msUntilNextKstMidnight(): number {
  const now = Date.now();
  const nowKst = now + KST_OFFSET_MS;
  const nextMidnightKst = Math.ceil(nowKst / 86_400_000) * 86_400_000;
  const nextMidnightUtc = nextMidnightKst - KST_OFFSET_MS;
  return Math.max(1000, nextMidnightUtc - now);
}

/** Refreshes server data when the KST calendar date changes while the app is open or refocused. */
export function DateRolloverWatcher() {
  const router = useRouter();
  const lastDateRef = useRef<string | null>(null);

  useEffect(() => {
    lastDateRef.current = kstIsoDate();

    function refreshIfDateChanged() {
      const current = kstIsoDate();
      if (current !== lastDateRef.current) {
        lastDateRef.current = current;
        router.refresh();
      }
    }

    let timer: ReturnType<typeof setTimeout>;
    function scheduleNextMidnightCheck() {
      timer = setTimeout(() => {
        refreshIfDateChanged();
        scheduleNextMidnightCheck();
      }, msUntilNextKstMidnight());
    }
    scheduleNextMidnightCheck();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") refreshIfDateChanged();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", refreshIfDateChanged);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", refreshIfDateChanged);
    };
  }, [router]);

  return null;
}
