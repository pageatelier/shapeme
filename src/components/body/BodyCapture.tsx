"use client";

import { useState } from "react";
import { ScaleIcon } from "@/components/icons";
import { todayIsoDate } from "@/lib/body/date";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";
import { challengeDayNumber, isMilestoneDay } from "@/lib/challenge/date";
import { PhotoSlotButton } from "./PhotoSlotButton";

const slots: BodyPhotoSlot[] = ["front", "side", "back"];

export function BodyCapture({ entries, weightKg, challengeStartDate }: { entries: BodyEntry[]; weightKg?: number | null; challengeStartDate?: string }) {
  const today = todayIsoDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const entry = entries.find((item) => item.date === selectedDate) ?? null;
  const day = challengeStartDate ? challengeDayNumber(challengeStartDate, selectedDate) : null;

  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[16px] font-bold tracking-[-0.02em] text-text-primary">오늘의 촬영</p>
          {day && day > 0 && day <= 100 && <p className="font-en mt-0.5 text-[10px] font-semibold tracking-[0.1em] text-pink-500 uppercase">Day {day}{isMilestoneDay(day) ? " · milestone" : ""}</p>}
        </div>
        {weightKg && <span className="flex items-center gap-1.5 text-xs text-text-muted"><ScaleIcon className="h-[14px] w-[14px] text-pink-400" />{weightKg}kg</span>}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input type="date" value={selectedDate} max={today} onChange={(event) => setSelectedDate(event.target.value || today)} className="min-h-[36px] rounded-full px-3 text-[13px] font-semibold text-text-primary" style={{ background: "var(--surface-card)", border: "var(--border-soft)" }} />
        {selectedDate !== today && <button type="button" onClick={() => setSelectedDate(today)} className="text-[11px] font-semibold text-pink-500">오늘로</button>}
      </div>

      <div className="grid grid-cols-3 gap-3" key={selectedDate}>
        {slots.map((slot) => (
          <PhotoSlotButton key={slot} slot={slot} date={selectedDate} filled={!!entry?.[slot]} imageUrl={slot === "front" ? entry?.frontImageUrl : slot === "side" ? entry?.sideImageUrl : entry?.backImageUrl} />
        ))}
      </div>
    </section>
  );
}
