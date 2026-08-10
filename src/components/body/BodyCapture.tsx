"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";
import { todayIsoDate } from "@/lib/body/date";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";
import { PhotoSlotButton } from "./PhotoSlotButton";

const additionalSlots: BodyPhotoSlot[] = ["side", "back", "full"];

/** Generic reference pose per slot, used as the live-camera overlay only for
 * a slot's very first-ever photo (before any previousImageUrl exists). Back
 * has no reference photo yet, so it reuses front's — placeholder until a
 * real back-pose reference is supplied. */
const GUIDE_IMAGE_BY_SLOT: Record<BodyPhotoSlot, string> = {
  front: "/body-guides/front.webp",
  side: "/body-guides/side.webp",
  back: "/body-guides/back.webp",
  full: "/body-guides/full.webp",
};

function hasAdditionalAngles(entry: BodyEntry | null | undefined) {
  return !!entry?.side || !!entry?.back || !!entry?.full;
}

function imageUrlFor(entry: BodyEntry | null, slot: BodyPhotoSlot): string | undefined {
  if (slot === "side") return entry?.sideImageUrl;
  if (slot === "back") return entry?.backImageUrl;
  if (slot === "full") return entry?.fullImageUrl;
  return entry?.frontImageUrl;
}

/** What a newly picked photo gets compared against before it uploads, so
 * the two shots line up. Prefers `date`'s own existing photo in this slot —
 * if you're retaking today's shot, that's the one you actually want to
 * match — and only falls back to the most recent earlier entry when today
 * doesn't have one yet. */
function previousImageUrlFor(entries: BodyEntry[], date: string, slot: BodyPhotoSlot): string | undefined {
  const current = entries.find((e) => e.date === date);
  if (current?.[slot]) return imageUrlFor(current, slot);

  const prior = entries
    .filter((e) => e.date !== date && e[slot])
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return prior ? imageUrlFor(prior, slot) : undefined;
}

/**
 * Capture UI for one day's photo(s). Only the front/primary slot is
 * required — side, back, and full body are optional extra angles, revealed
 * via "Add another angle", auto-expanded if that day already has any saved
 * (so returning to an already-multi-angle day doesn't hide them). The front
 * slot uses PhotoSlotButton's "cta" empty state (big "Take your Shape
 * Shot" card) instead of the small tile every other slot uses.
 */
export function BodyCapture({ entries }: { entries: BodyEntry[] }) {
  const today = todayIsoDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const entry = entries.find((e) => e.date === selectedDate) ?? null;
  const [showMore, setShowMore] = useState(() => hasAdditionalAngles(entry));

  function changeDate(next: string) {
    setSelectedDate(next);
    setShowMore(hasAdditionalAngles(entries.find((e) => e.date === next)));
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => changeDate(e.target.value || today)}
          className="min-h-[32px] rounded-full px-3 text-[12px] font-semibold text-text-primary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
        {selectedDate !== today && (
          <>
            <button type="button" onClick={() => changeDate(today)} className="text-[11px] font-semibold text-pink-500">
              {bodyCopy.capture.backToToday}
            </button>
            <span className="text-[11px] text-text-secondary">{bodyCopy.capture.backfilling}</span>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3" key={selectedDate}>
        <div className="mx-auto w-full max-w-[220px]">
          <PhotoSlotButton
            slot="front"
            date={selectedDate}
            filled={!!entry?.front}
            imageUrl={entry?.frontImageUrl}
            previousImageUrl={previousImageUrlFor(entries, selectedDate, "front")}
            guideImageUrl={GUIDE_IMAGE_BY_SLOT.front}
            emptyVariant="cta"
          />
        </div>

        {showMore ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              {additionalSlots.map((slot) => (
                <PhotoSlotButton
                  key={slot}
                  slot={slot}
                  date={selectedDate}
                  filled={!!entry?.[slot]}
                  imageUrl={imageUrlFor(entry, slot)}
                  previousImageUrl={previousImageUrlFor(entries, selectedDate, slot)}
                  guideImageUrl={GUIDE_IMAGE_BY_SLOT[slot]}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowMore(false)}
              className="flex min-h-[32px] items-center justify-center gap-1.5 text-[11px] font-semibold text-text-muted"
            >
              <PlusIcon className="h-3 w-3 rotate-45" />
              {bodyCopy.capture.collapseAngle}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="flex min-h-[32px] items-center justify-center gap-1.5 text-[11px] font-semibold text-text-muted"
          >
            <PlusIcon className="h-3 w-3" />
            {bodyCopy.capture.addAngle}
          </button>
        )}
      </div>
    </section>
  );
}
