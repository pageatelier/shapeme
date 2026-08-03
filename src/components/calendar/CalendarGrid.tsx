"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { BodyThumb } from "@/components/body/BodyThumb";
import type { CalendarDay } from "@/lib/calendar/types";
import type { WeekStartDay } from "@/lib/settings/types";

const WEEKDAY_LABELS: Record<WeekStartDay, string[]> = {
  sun: ["일", "월", "화", "수", "목", "금", "토"],
  mon: ["월", "화", "수", "목", "금", "토", "일"],
};

function dayStyle(rate: number | null): CSSProperties {
  if (rate === null) {
    return { background: "transparent", color: "var(--color-text-disabled)" };
  }
  if (rate === 0) {
    return { background: "var(--color-bg-warm)", color: "var(--color-text-muted)" };
  }
  if (rate < 40) {
    return { background: "var(--color-pink-100)", color: "var(--color-text-secondary)" };
  }
  if (rate < 70) {
    return { background: "var(--color-peach-300)", color: "var(--color-text-inverse)" };
  }
  if (rate < 100) {
    return { background: "var(--color-pink-400)", color: "var(--color-text-inverse)" };
  }
  return { background: "var(--gradient-primary)", color: "var(--color-text-inverse)" };
}

export function CalendarGrid({
  days,
  firstWeekday,
  weekStartDay = "sun",
}: {
  days: CalendarDay[];
  firstWeekday: number;
  weekStartDay?: WeekStartDay;
}) {
  const todayEntry = days.find((d) => d.isToday);
  const [selectedIso, setSelectedIso] = useState(todayEntry?.isoDate ?? days[0]?.isoDate ?? null);
  const selectedDay = days.find((d) => d.isoDate === selectedIso) ?? null;
  const weekdayLabels = WEEKDAY_LABELS[weekStartDay];

  return (
    <>
      <div className="glass-card p-4">
        <div className="mb-2 grid grid-cols-7 text-center">
          {weekdayLabels.map((w) => (
            <span key={w} className="font-en text-[10px] font-semibold text-text-muted">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => (
            <button
              key={day.isoDate}
              type="button"
              onClick={() => setSelectedIso(day.isoDate)}
              className="font-en flex aspect-square items-center justify-center rounded-[var(--radius-sm)] text-[12px] font-semibold"
              style={{
                ...dayStyle(day.completionRate),
                outline: day.isToday
                  ? "2px solid var(--color-pink-500)"
                  : selectedIso === day.isoDate
                    ? "2px solid rgba(86,62,58,0.3)"
                    : "none",
                outlineOffset: 1,
              }}
            >
              {day.date}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-text-muted">
        <LegendDot style={{ background: "var(--color-bg-warm)" }} label="0%" />
        <LegendDot style={{ background: "var(--color-pink-100)" }} label="1~39%" />
        <LegendDot style={{ background: "var(--color-peach-300)" }} label="40~69%" />
        <LegendDot style={{ background: "var(--color-pink-400)" }} label="70~99%" />
        <LegendDot style={{ background: "var(--gradient-primary)" }} label="100%" />
      </div>

      {selectedDay && (
        <section className="surface-card p-4">
          <p className="mb-2 text-[13px] font-bold text-text-primary">
            {Number(selectedDay.isoDate.slice(5, 7))}월 {selectedDay.date}일
          </p>
          {selectedDay.completionRate === null ? (
            <p className="text-xs text-text-muted">아직 오지 않은 날이에요.</p>
          ) : selectedDay.completionRate === 0 ? (
            <p className="text-xs text-text-muted">아직 기록이 없어요.</p>
          ) : (
            <>
              <p className="mb-3 text-xs text-text-muted">
                그날의 전체 달성률 {selectedDay.completionRate}%
              </p>
              <div className="mb-4 flex gap-4 text-[11px]">
                <StatusChip label="운동" done={selectedDay.workoutDone} />
                <StatusChip label="식단" done={selectedDay.mealDone} />
                <StatusChip label="물" done={selectedDay.waterDone} />
              </div>
            </>
          )}

          <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.08em] text-text-muted lowercase">
            오늘의 눈바디
          </p>
          {selectedDay.body ? (
            <Link href={`/body/${selectedDay.body.date}`} className="flex gap-3">
              <BodyThumb slot="front" filled={selectedDay.body.front} size={44} />
              <BodyThumb slot="side" filled={selectedDay.body.side} size={44} />
              <BodyThumb slot="back" filled={selectedDay.body.back} size={44} />
            </Link>
          ) : (
            <p className="text-xs text-text-muted">기록된 눈바디 사진이 없어요.</p>
          )}

          {selectedDay.memo && (
            <>
              <p className="font-en mt-4 mb-2 text-[11px] font-semibold tracking-[0.08em] text-text-muted lowercase">
                오늘의 메모
              </p>
              <p className="text-[13px] leading-relaxed text-text-secondary">{selectedDay.memo}</p>
            </>
          )}
        </section>
      )}
    </>
  );
}

function StatusChip({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className="flex items-center gap-1.5 font-semibold"
      style={{ color: done ? "var(--color-success)" : "var(--color-text-disabled)" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: done ? "var(--color-success)" : "var(--color-text-disabled)" }}
      />
      {label}
    </span>
  );
}

function LegendDot({ style, label }: { style: CSSProperties; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-full" style={style} />
      {label}
    </span>
  );
}
