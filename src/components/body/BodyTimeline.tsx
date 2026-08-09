"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";
import { getJourneyProgress } from "@/lib/journey";
import { primaryPhotoUrl } from "@/lib/body/types";
import type { BodyEntry } from "@/lib/body/types";

// Only mounted once a thumbnail is tapped, so its JS ships in its own chunk
// instead of the Body page's initial bundle (same pattern as TogetherStories'
// StoryViewer).
const BodyFeedViewer = dynamic(() => import("./BodyFeedViewer").then((m) => m.BodyFeedViewer), {
  ssr: false,
});

// Caps how many recent entries render at once — this is a glance strip, not
// a full-history browser (matches the horizontal-scroll footprint of the
// mockup), and keeps the DOM bounded for anyone with a long streak.
const VISIBLE_COUNT = 20;

/** Horizontal strip of recent entries, newest first, each captioned by its
 * program week (not the date — "This Week's Shape" above already gives the
 * date context) so the strip visually reads as a week-by-week progression. */
export function BodyTimeline({
  entries,
  startedAt,
  goalPeriod,
}: {
  entries: BodyEntry[];
  startedAt: string;
  goalPeriod: string;
}) {
  const [openDate, setOpenDate] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, VISIBLE_COUNT),
    [entries],
  );

  if (sorted.length === 0) {
    return (
      <section>
        <p className="font-en mb-3 text-[10px] font-semibold tracking-[0.14em] text-text-muted">
          {bodyCopy.pastShapes.title}
        </p>
        <div className="surface-card p-5 text-center text-[13px] text-text-muted">{bodyCopy.pastShapes.empty}</div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-en text-[10px] font-semibold tracking-[0.14em] text-text-muted">
          {bodyCopy.pastShapes.title}
        </p>
        <button type="button" onClick={() => setOpenDate(sorted[0].date)} aria-label={bodyCopy.pastShapes.loadMore}>
          <ChevronRightIcon className="h-4 w-4 text-text-muted" />
        </button>
      </div>

      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {sorted.map((entry) => {
          const url = primaryPhotoUrl(entry);
          const week = getJourneyProgress({ startedAt, goalPeriod, now: new Date(entry.date) }).currentWeek;
          return (
            <button
              key={entry.date}
              type="button"
              onClick={() => setOpenDate(entry.date)}
              aria-label={`${entry.dateLabel}`}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <div
                className="relative h-20 w-16 overflow-hidden rounded-[var(--radius-md)]"
                style={{ background: "linear-gradient(160deg, var(--color-bg-warm), var(--color-pink-200))" }}
              >
                {url && <Image src={url} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <span className="font-en text-[9px] font-semibold tracking-[0.06em] text-text-muted">
                {bodyCopy.pastShapes.week(week)}
              </span>
            </button>
          );
        })}
      </div>

      {openDate && (
        <BodyFeedViewer entries={sorted} initialDate={openDate} onClose={() => setOpenDate(null)} />
      )}
    </section>
  );
}
