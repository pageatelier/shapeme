"use client";

import { useState } from "react";
import { PlusIcon, ScaleIcon } from "@/components/icons";
import { todayIsoDate } from "@/lib/body/date";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";
import { PhotoSlotButton } from "./PhotoSlotButton";

const additionalSlots: BodyPhotoSlot[] = ["side", "back"];

function hasAdditionalAngles(entry: BodyEntry | null | undefined) {
  return !!entry?.side || !!entry?.back;
}

/**
 * Capture UI for one day's photo(s). Only the front/primary slot is
 * required — side and back are optional extra angles revealed via
 * "다른 각도 추가", auto-expanded if that day already has either saved
 * (so returning to an already-multi-angle day doesn't hide them). Saving
 * with just the primary photo already worked at the data layer (every
 * body_entries photo column is independently nullable) — this only
 * changes which slots are visible by default.
 */
export function BodyCapture({
  entries,
  weightKg,
}: {
  entries: BodyEntry[];
  weightKg?: number;
}) {
  const today = todayIsoDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const entry = entries.find((e) => e.date === selectedDate) ?? null;
  const [showMore, setShowMore] = useState(() => hasAdditionalAngles(entry));

  function changeDate(next: string) {
    setSelectedDate(next);
    setShowMore(hasAdditionalAngles(entries.find((e) => e.date === next)));
  }

  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">Capture</p>
        {weightKg && (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <ScaleIcon className="h-[14px] w-[14px] text-pink-400" />
            {weightKg}kg
          </span>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => changeDate(e.target.value || today)}
          className="min-h-[36px] rounded-full px-3 text-[13px] font-semibold text-text-primary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
        {selectedDate !== today && (
          <button type="button" onClick={() => changeDate(today)} className="text-[11px] font-semibold text-pink-500">
            오늘로
          </button>
        )}
        {selectedDate !== today && (
          <span className="font-en text-[11px] text-text-muted lowercase">지난 기록 추가 중</span>
        )}
      </div>

      <div className="flex flex-col gap-3" key={selectedDate}>
        <div className="mx-auto w-full max-w-[160px]">
          <PhotoSlotButton
            slot="front"
            date={selectedDate}
            filled={!!entry?.front}
            imageUrl={entry?.frontImageUrl}
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
              className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold text-text-muted"
            >
              <PlusIcon className="h-3 w-3 rotate-45" />
              다른 각도 접기
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-text-secondary"
            style={{ background: "var(--surface-card)", border: "1px dashed rgba(86, 62, 58, 0.2)" }}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            다른 각도 추가
          </button>
        )}
      </div>
    </section>
  );
}
