"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";
import { todayIsoDate } from "@/lib/body/date";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";
import { PhotoSlotButton } from "./PhotoSlotButton";

const additionalSlots: BodyPhotoSlot[] = ["side", "back"];

function hasAdditionalAngles(entry: BodyEntry | null | undefined) {
  return !!entry?.side || !!entry?.back;
}

/**
 * Capture UI for one day's photo(s). Only the front/primary slot is
 * required — side and back are optional extra angles, revealed via "Add
 * another angle", auto-expanded if that day already has either saved (so
 * returning to an already-multi-angle day doesn't hide them). The front
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
            emptyVariant="cta"
          />
        </div>

        {showMore ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {additionalSlots.map((slot) => (
                <PhotoSlotButton
                  key={slot}
                  slot={slot}
                  date={selectedDate}
                  filled={!!entry?.[slot]}
                  imageUrl={slot === "side" ? entry?.sideImageUrl : entry?.backImageUrl}
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
