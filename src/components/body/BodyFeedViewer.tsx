"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { UIEvent } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";
import { formatDateLabelWithYear } from "@/lib/body/date";
import { deleteBodyPhoto } from "@/lib/body/upload";
import { primarySlot, SLOT_LABELS } from "@/lib/body/types";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";

const SLOT_ORDER: BodyPhotoSlot[] = ["front", "side", "back", "full"];

function urlForSlot(entry: BodyEntry, slot: BodyPhotoSlot): string | undefined {
  if (slot === "front") return entry.frontImageUrl;
  if (slot === "side") return entry.sideImageUrl;
  if (slot === "back") return entry.backImageUrl;
  return entry.fullImageUrl;
}

/** Front → side → back → full, filtered to whichever slots actually have a
 * photo — the order the swipe carousel presents them in. */
function availableSlots(entry: BodyEntry): { slot: BodyPhotoSlot; url: string }[] {
  return SLOT_ORDER.map((slot) => ({ slot, url: urlForSlot(entry, slot) })).filter(
    (s): s is { slot: BodyPhotoSlot; url: string } => !!s.url,
  );
}

/**
 * Full-screen scroll-through view opened from a Timeline grid tile — entries
 * stay in the same (newest-first) order as the grid, and the tapped date is
 * scrolled to on open so continuing to scroll moves through the rest.
 */
export function BodyFeedViewer({
  entries,
  initialDate,
  onClose,
}: {
  entries: BodyEntry[];
  initialDate: string;
  onClose: () => void;
}) {
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const router = useRouter();

  // Local copy so a delete can update this scroll view immediately instead
  // of waiting for router.refresh() to flow a new `entries` prop back down.
  const [localEntries, setLocalEntries] = useState(entries);
  // Which slot each entry's swipe carousel is currently showing — defaults
  // lazily to primarySlot() the first time an entry is rendered/scrolled to,
  // so 삭제 always acts on whichever photo is actually on screen.
  const [activeSlotByDate, setActiveSlotByDate] = useState<Record<string, BodyPhotoSlot>>({});
  const [confirmingDeleteDate, setConfirmingDeleteDate] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCarouselScroll(entry: BodyEntry, slots: BodyPhotoSlot[]) {
    return (e: UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (el.clientWidth === 0) return;
      const index = Math.min(slots.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)));
      const slot = slots[index];
      setActiveSlotByDate((prev) => (prev[entry.date] === slot ? prev : { ...prev, [entry.date]: slot }));
    };
  }

  async function handleDelete(entry: BodyEntry) {
    const slot = activeSlotByDate[entry.date] ?? primarySlot(entry);
    if (!slot) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteBodyPhoto({ date: entry.date, slot });
      setLocalEntries((prev) =>
        prev
          .map((e) => {
            if (e.date !== entry.date) return e;
            if (slot === "front") return { ...e, front: false, frontImageUrl: undefined };
            if (slot === "side") return { ...e, side: false, sideImageUrl: undefined };
            if (slot === "back") return { ...e, back: false, backImageUrl: undefined };
            return { ...e, full: false, fullImageUrl: undefined };
          })
          // A day with no photo left has nothing to show here — matches
          // getBodyEntries filtering the same rows out of Past Shapes.
          .filter((e) => e.front || e.side || e.back || e.full),
      );
      setActiveSlotByDate((prev) => {
        const next = { ...prev };
        delete next[entry.date];
        return next;
      });
      setConfirmingDeleteDate(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : bodyCopy.feedViewer.deleteError);
    } finally {
      setDeleting(false);
    }
  }

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

  // Portaled straight to document.body — same stacking-context escape as
  // LiveCameraCapture/PhotoSlotButton's review overlay: this component
  // renders inside .app-content, which creates its own stacking context, so
  // a fixed child here can never out-rank BottomNav (a sibling of
  // .app-content, not a descendant) no matter its own z-index.
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--color-bg)" }}>
      <div
        className="flex shrink-0 items-center justify-end px-4 pb-3"
        style={{
          paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
          background: "var(--glass-background-strong)",
          borderBottom: "1px solid var(--glass-border)",
          backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
          WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={bodyCopy.feedViewer.close}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <CloseIcon className="h-4 w-4 text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[var(--container-sm)] flex-col gap-6 px-5 py-5">
          {localEntries.map((entry) => {
            const slots = availableSlots(entry);
            const url = slots.length > 0 ? slots[0].url : undefined;
            const activeSlot = activeSlotByDate[entry.date] ?? primarySlot(entry);
            const activeIndex = Math.max(
              0,
              slots.findIndex((s) => s.slot === activeSlot),
            );
            const isConfirming = confirmingDeleteDate === entry.date;
            return (
              <div
                key={entry.date}
                ref={(el) => {
                  if (el) itemRefs.current.set(entry.date, el);
                  else itemRefs.current.delete(entry.date);
                }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-text-primary">{formatDateLabelWithYear(entry.date)}</p>
                  {url &&
                    (isConfirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-secondary">{bodyCopy.feedViewer.confirmDelete}</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          disabled={deleting}
                          className="text-[11px] font-semibold text-error disabled:opacity-60"
                        >
                          {deleting ? bodyCopy.feedViewer.deleting : bodyCopy.feedViewer.delete}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteDate(null)}
                          disabled={deleting}
                          className="text-[11px] font-semibold text-text-muted disabled:opacity-60"
                        >
                          {bodyCopy.feedViewer.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteDate(entry.date)}
                        className="text-[11px] font-semibold text-text-muted"
                      >
                        {bodyCopy.feedViewer.delete}
                      </button>
                    ))}
                </div>
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-lg)]"
                  style={{ background: "linear-gradient(160deg, var(--color-bg-warm), var(--color-pink-200))" }}
                >
                  {slots.length > 0 && (
                    <div
                      className="scrollbar-hide flex h-full w-full snap-x snap-mandatory overflow-x-auto"
                      onScroll={handleCarouselScroll(
                        entry,
                        slots.map((s) => s.slot),
                      )}
                    >
                      {slots.map(({ slot, url: slotUrl }) => (
                        <div key={slot} className="relative h-full w-full shrink-0 snap-start">
                          <Image
                            src={slotUrl}
                            alt={`${entry.dateLabel} ${SLOT_LABELS[slot]} photo`}
                            fill
                            sizes="(max-width: 480px) 100vw, 480px"
                            className="object-cover"
                            priority={entry.date === initialDate && slot === slots[0].slot}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {slots.length > 1 && (
                    <>
                      <span
                        className="pointer-events-none absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ background: "rgba(0,0,0,0.35)" }}
                      >
                        {SLOT_LABELS[slots[activeIndex]?.slot ?? slots[0].slot]}
                      </span>
                      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {slots.map((s, i) => (
                          <span
                            key={s.slot}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: i === activeIndex ? "white" : "rgba(255,255,255,0.45)" }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {entry.memo && <p className="text-[13px] leading-relaxed text-text-secondary">{entry.memo}</p>}
              </div>
            );
          })}
          {error && <p className="text-center text-[11px] text-error">{error}</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
