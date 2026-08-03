"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";
import { formatDateLabelWithYear, todayIsoDate } from "@/lib/body/date";
import { primaryPhotoUrl } from "@/lib/body/types";
import type { BodyEntry } from "@/lib/body/types";

/**
 * Full-screen scroll-through view opened from a Timeline grid tile — entries
 * stay in the same (newest-first) order as the grid, and the tapped date is
 * scrolled to on open so continuing to scroll moves through the rest.
 */
export function BodyFeedViewer({
  entries,
  initialDate,
  weightKg,
  onClose,
}: {
  entries: BodyEntry[];
  initialDate: string;
  weightKg: number | null;
  onClose: () => void;
}) {
  // Only the current weight is stored (no per-date history), so it's only
  // honest to show it next to today's entry, not implied for past dates.
  const todayIso = todayIsoDate();
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    itemRefs.current.get(initialDate)?.scrollIntoView({ block: "start" });
    // Only run once on open — the initial scroll shouldn't re-fire on re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--color-bg)" }}>
      <div
        className="flex shrink-0 items-center justify-end px-4 py-3"
        style={{
          background: "var(--glass-background-strong)",
          borderBottom: "1px solid var(--glass-border)",
          backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
          WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <CloseIcon className="h-4 w-4 text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[var(--container-sm)] flex-col gap-6 px-5 py-5">
          {entries.map((entry) => {
            const url = primaryPhotoUrl(entry);
            return (
              <div
                key={entry.date}
                ref={(el) => {
                  if (el) itemRefs.current.set(entry.date, el);
                  else itemRefs.current.delete(entry.date);
                }}
                className="flex flex-col gap-2"
              >
                <p className="text-[13px] font-bold text-text-primary">
                  {formatDateLabelWithYear(entry.date)}
                  {entry.date === todayIso && weightKg != null && (
                    <span className="ml-1.5 font-normal text-text-secondary">· 체중 {weightKg}kg</span>
                  )}
                </p>
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-lg)]"
                  style={{ background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }}
                >
                  {url && (
                    <Image
                      src={url}
                      alt={`${entry.dateLabel} 사진`}
                      fill
                      sizes="(max-width: 480px) 100vw, 480px"
                      className="object-cover"
                      priority={entry.date === initialDate}
                    />
                  )}
                </div>
                {entry.memo && <p className="text-[13px] leading-relaxed text-text-secondary">{entry.memo}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
