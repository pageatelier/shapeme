"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Today's KST date as YYYY-MM-DD, computed in the browser. Kept separate
 * from src/lib/body/date.ts (a server-only module) since this runs client-side. */
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

/** Milliseconds until the next Asia/Seoul midnight. KST has no DST, so a
 * fixed +9h offset is exact year-round. */
function msUntilNextKstMidnight(): number {
  const now = Date.now();
  const nowKst = now + KST_OFFSET_MS;
  const nextMidnightKst = Math.ceil(nowKst / 86_400_000) * 86_400_000;
  const nextMidnightUtc = nextMidnightKst - KST_OFFSET_MS;
  return Math.max(1000, nextMidnightUtc - now);
}

/**
 * Keeps Today/Workout/Body/Calendar/My in sync with the Korean calendar day
 * while the app is left open across midnight, and catches the rollover on
 * the next focus/visibility change if the tab (or PWA) was left in the
 * background or fully closed overnight. Every page already re-derives its
 * "today" server-side via todayIsoDate() on each request — this component's
 * only job is deciding *when* to ask for a fresh one via router.refresh().
 */
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
