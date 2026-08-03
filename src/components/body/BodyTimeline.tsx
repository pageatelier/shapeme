"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FlowerIcon } from "@/components/icons";
import { formatYearMonthLabel } from "@/lib/body/date";
import { primaryPhotoUrl } from "@/lib/body/types";
import type { BodyEntry } from "@/lib/body/types";

const PAGE_SIZE = 20;

// Only mounted once a grid photo is tapped, so its JS ships in its own
// chunk instead of the Body page's initial bundle (same pattern as
// TogetherStories' StoryViewer).
const BodyFeedViewer = dynamic(() => import("./BodyFeedViewer").then((m) => m.BodyFeedViewer), {
  ssr: false,
});

function yearMonthKey(date: string) {
  return date.slice(0, 7); // "YYYY-MM"
}

export function BodyTimeline({ entries, weightKg }: { entries: BodyEntry[]; weightKg: number | null }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openDate, setOpenDate] = useState<string | null>(null);

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const visible = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visible.length;

  const groups = new Map<string, BodyEntry[]>();
  for (const entry of visible) {
    const key = yearMonthKey(entry.date);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(key, [entry]);
    }
  }

  if (sorted.length === 0) {
    return (
      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">지난 기록</p>
        <div className="surface-card p-5 text-center text-[13px] text-text-muted">
          아직 눈바디 기록이 없어요. 위에서 사진을 촬영해 첫 기록을 남겨보세요.
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">지난 기록</p>
      <div className="flex flex-col gap-5">
        {[...groups.entries()].map(([key, monthEntries]) => (
          <div key={key}>
            <p className="mb-2 text-[13px] font-bold tracking-[-0.01em] text-text-secondary">
              {formatYearMonthLabel(monthEntries[0].date)}
            </p>
            <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-[var(--radius-md)]">
              {monthEntries.map((entry) => {
                const url = primaryPhotoUrl(entry);
                return (
                  <button
                    key={entry.date}
                    type="button"
                    onClick={() => setOpenDate(entry.date)}
                    aria-label={`${entry.dateLabel} 기록 보기`}
                    className="relative aspect-square"
                    style={{ background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }}
                  >
                    {url && (
                      <Image
                        src={url}
                        alt=""
                        fill
                        sizes="(max-width: 480px) 33vw, 160px"
                        className="object-cover"
                      />
                    )}
                  </button>
                );
              })}
              {/* Pads the row out to a full multiple of 3 — without this, a
                  month with e.g. 1 photo left the other two grid tracks
                  completely empty (see-through to the page background),
                  which read as a rendering glitch rather than "no photo yet". */}
              {Array.from({ length: (3 - (monthEntries.length % 3)) % 3 }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="relative flex aspect-square items-center justify-center"
                  style={{ background: "linear-gradient(160deg, var(--color-peach-100), var(--color-pink-100))" }}
                >
                  <FlowerIcon className="h-6 w-6 text-white/70" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
          className="mt-4 w-full rounded-full py-3 text-center text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          더 보기
        </button>
      )}

      {openDate && (
        <BodyFeedViewer
          entries={visible}
          initialDate={openDate}
          weightKg={weightKg}
          onClose={() => setOpenDate(null)}
        />
      )}
    </section>
  );
}
