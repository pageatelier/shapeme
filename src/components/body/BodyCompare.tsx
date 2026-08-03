"use client";

import Image from "next/image";
import { useState } from "react";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";

const slots: BodyPhotoSlot[] = ["front", "side", "back"];

/**
 * MVP comparison: two dates, side-by-side per angle. A slider comparison
 * is a planned follow-up — this component only needs its `entries` prop
 * swapped for real data later, so the slider can land without touching
 * callers.
 */
export function BodyCompare({ entries }: { entries: BodyEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const [leftDate, setLeftDate] = useState(sorted[0]?.date ?? "");
  const [rightDate, setRightDate] = useState(sorted[sorted.length - 1]?.date ?? "");
  const [expanded, setExpanded] = useState(false);

  if (sorted.length < 2) {
    return (
      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">Compare</p>
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
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[17px] font-bold tracking-[-0.025em] text-text-primary">Compare</p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "비교 접기" : "비교 펼치기"}
          aria-expanded={expanded}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[15px] leading-none font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      {expanded && (
        <div className="glass-card p-5">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <DateSelect value={leftDate} onChange={setLeftDate} entries={sorted} />
            <DateSelect value={rightDate} onChange={setRightDate} entries={sorted} />
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
      )}
    </section>
  );
}

function DateSelect({
  value,
  onChange,
  entries,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: BodyEntry[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full px-3 py-2 text-[13px] font-semibold text-text-primary"
      style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
    >
      {entries.map((e) => (
        <option key={e.date} value={e.date}>
          {e.dateLabel}
        </option>
      ))}
    </select>
  );
}

function ComparePane({ entry, slot }: { entry: BodyEntry | undefined; slot: BodyPhotoSlot }) {
  const filled = !!entry?.[slot];
  const imageUrl =
    slot === "front" ? entry?.frontImageUrl : slot === "side" ? entry?.sideImageUrl : entry?.backImageUrl;

  return (
    <div
      className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[var(--radius-md)] text-[11px] text-text-inverse"
      style={
        filled
          ? { background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }
          : { background: "var(--color-bg-warm)", color: "var(--color-text-muted)" }
      }
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${slot} 비교 사진`}
          fill
          sizes="(max-width: 480px) 45vw, 200px"
          className="object-cover"
        />
      ) : filled ? (
        ""
      ) : (
        "기록 없음"
      )}
    </div>
  );
}
