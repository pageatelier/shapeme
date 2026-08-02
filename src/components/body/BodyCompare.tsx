"use client";

import { useState } from "react";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";
import { challengeDayNumber } from "@/lib/challenge/date";

const slots: BodyPhotoSlot[] = ["front", "side", "back"];

/**
 * MVP comparison: two dates, side-by-side per angle. A slider comparison
 * is a planned follow-up — this component only needs its `entries` prop
 * swapped for real data later, so the slider can land without touching
 * callers.
 */
export function BodyCompare({ entries, challengeStartDate }: { entries: BodyEntry[]; challengeStartDate?: string }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const [leftDate, setLeftDate] = useState(sorted[0]?.date ?? "");
  const [rightDate, setRightDate] = useState(sorted[sorted.length - 1]?.date ?? "");

  if (sorted.length < 2) {
    return (
      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">변화 비교</p>
        <div className="surface-card p-5 text-center text-[13px] text-text-muted">
          비교하려면 눈바디 기록이 2개 이상 필요해요.
        </div>
      </section>
    );
  }

  const left = sorted.find((e) => e.date === leftDate);
  const right = sorted.find((e) => e.date === rightDate);

  return (
    <section>
      <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">변화 비교</p>
      <div className="glass-card p-5">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <DateSelect value={leftDate} onChange={setLeftDate} entries={sorted} challengeStartDate={challengeStartDate} />
          <DateSelect value={rightDate} onChange={setRightDate} entries={sorted} challengeStartDate={challengeStartDate} />
        </div>

        {slots.map((slot) => (
          <div key={slot} className="mb-4 last:mb-0">
            <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.08em] text-text-muted lowercase">
              {slot}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ComparePane entry={left} slot={slot} />
              <ComparePane entry={right} slot={slot} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DateSelect({
  value,
  onChange,
  entries,
  challengeStartDate,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: BodyEntry[];
  challengeStartDate?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full px-3 py-2 text-[13px] font-semibold text-text-primary"
      style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
    >
      {entries.map((e) => {
        const day = challengeStartDate ? challengeDayNumber(challengeStartDate, e.date) : null;
        const dayLabel = day !== null && day >= 1 && day <= 100 ? `Day ${day} · ` : "";
        return (
          <option key={e.date} value={e.date}>
            {dayLabel}{e.dateLabel}
          </option>
        );
      })}
    </select>
  );
}

function ComparePane({ entry, slot }: { entry: BodyEntry | undefined; slot: BodyPhotoSlot }) {
  const filled = !!entry?.[slot];
  const imageUrl =
    slot === "front" ? entry?.frontImageUrl : slot === "side" ? entry?.sideImageUrl : entry?.backImageUrl;

  return (
    <div
      className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[var(--radius-md)] text-[11px] text-text-inverse"
      style={
        filled
          ? { background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }
          : { background: "var(--color-bg-warm)", color: "var(--color-text-muted)" }
      }
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={`${slot} 비교 사진`} className="h-full w-full object-cover" />
      ) : filled ? (
        ""
      ) : (
        "기록 없음"
      )}
    </div>
  );
}
