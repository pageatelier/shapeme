"use client";

import { useState } from "react";
import { ScaleIcon } from "@/components/icons";
import { todayIsoDate } from "@/lib/body/date";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";
import { PhotoSlotButton } from "./PhotoSlotButton";

const slots: BodyPhotoSlot[] = ["front", "side", "back"];

/**
 * Capture UI for one day's Front/Side/Back photos. Defaults to today, but
 * the date picker lets you switch to any past day — useful for backfilling
 * old 눈바디 photos so they show up in Timeline/Compare. Actual per-slot
 * upload lives in PhotoSlotButton (shared with TodayBodyCard); this
 * component just owns the date picker and re-mounts the slots (via `key`)
 * whenever the date changes so each one resets to that day's real state.
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
          onChange={(e) => setSelectedDate(e.target.value || today)}
          className="min-h-[36px] rounded-full px-3 text-[13px] font-semibold text-text-primary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
        {selectedDate !== today && (
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className="text-[11px] font-semibold text-pink-500"
          >
            오늘로
          </button>
        )}
        {selectedDate !== today && (
          <span className="font-en text-[11px] text-text-muted lowercase">지난 기록 추가 중</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3" key={selectedDate}>
        {slots.map((slot) => (
          <PhotoSlotButton
            key={slot}
            slot={slot}
            date={selectedDate}
            filled={!!entry?.[slot]}
            imageUrl={
              slot === "front" ? entry?.frontImageUrl : slot === "side" ? entry?.sideImageUrl : entry?.backImageUrl
            }
          />
        ))}
      </div>
    </section>
  );
}
