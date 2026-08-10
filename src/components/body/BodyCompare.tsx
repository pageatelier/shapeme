"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { HourglassIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";
import { getJourneyProgress } from "@/lib/journey";
import { formatDateLabelWithYear } from "@/lib/body/date";
import { SLOT_LABELS } from "@/lib/body/types";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";

const slots: BodyPhotoSlot[] = ["front", "side", "back", "full"];

export function BodyCompare({
  entries,
  startedAt,
  goalPeriod,
}: {
  entries: BodyEntry[];
  startedAt: string;
  goalPeriod: string;
}) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const [leftDate, setLeftDate] = useState(sorted[0]?.date ?? "");
  const [rightDate, setRightDate] = useState(sorted[sorted.length - 1]?.date ?? "");
  const [activeSlot, setActiveSlot] = useState<BodyPhotoSlot>("front");

  const weekByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of sorted) {
      map.set(e.date, getJourneyProgress({ startedAt, goalPeriod, now: new Date(e.date) }).currentWeek);
    }
    return map;
  }, [sorted, startedAt, goalPeriod]);

  if (sorted.length < 2) {
    return (
      <div className="surface-card p-5 text-center text-[13px] text-text-muted">{bodyCopy.compare.needMore}</div>
    );
  }

  const left = sorted.find((e) => e.date === leftDate);
  const right = sorted.find((e) => e.date === rightDate);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center justify-between rounded-full px-4 py-2.5"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      >
        <WeekSelect value={leftDate} onChange={setLeftDate} entries={sorted} weekByDate={weekByDate} />
        <HourglassIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        <WeekSelect value={rightDate} onChange={setRightDate} entries={sorted} weekByDate={weekByDate} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setActiveSlot(slot)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${activeSlot === slot ? "pill-selected" : "pill-unselected"}`}
          >
            {SLOT_LABELS[slot]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ComparePane entry={left} slot={activeSlot} />
        <ComparePane entry={right} slot={activeSlot} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <EntryCaption entry={left} week={left ? weekByDate.get(left.date) : undefined} />
        <EntryCaption entry={right} week={right ? weekByDate.get(right.date) : undefined} />
      </div>
    </div>
  );
}

function WeekSelect({
  value,
  onChange,
  entries,
  weekByDate,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: BodyEntry[];
  weekByDate: Map<string, number>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="font-en bg-transparent text-[11px] font-semibold tracking-[0.08em] text-text-primary"
    >
      {entries.map((e) => (
        <option key={e.date} value={e.date}>
          {bodyCopy.pastShapes.week(weekByDate.get(e.date) ?? 1)}
        </option>
      ))}
    </select>
  );
}

function EntryCaption({ entry, week }: { entry: BodyEntry | undefined; week: number | undefined }) {
  if (!entry) return <div />;
  return (
    <div>
      <p className="font-en text-[11px] font-semibold text-text-primary">{bodyCopy.pastShapes.week(week ?? 1)}</p>
      <p className="text-[10px] text-text-muted">{formatDateLabelWithYear(entry.date)}</p>
    </div>
  );
}

function ComparePane({ entry, slot }: { entry: BodyEntry | undefined; slot: BodyPhotoSlot }) {
  const filled = !!entry?.[slot];
  const imageUrl =
    slot === "front"
      ? entry?.frontImageUrl
      : slot === "side"
        ? entry?.sideImageUrl
        : slot === "back"
          ? entry?.backImageUrl
          : entry?.fullImageUrl;

  return (
    <div
      className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] text-[11px] text-text-inverse"
      style={
        filled
          ? { background: "linear-gradient(160deg, var(--color-bg-warm), var(--color-pink-200))" }
          : { background: "var(--color-bg-warm)", color: "var(--color-text-muted)" }
      }
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${SLOT_LABELS[slot]} comparison photo`}
          fill
          sizes="(max-width: 480px) 45vw, 200px"
          className="object-cover"
        />
      ) : filled ? (
        ""
      ) : (
        bodyCopy.compare.noEntry
      )}
    </div>
  );
}
