"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { getMyRecordDetailAction, getMyRecordsMonthAction } from "@/lib/records/actions";
import type { RecordCalendarDay, RecordDetail } from "@/lib/records/types";
import type { WeekStartDay } from "@/lib/settings/types";
import { MyRecordDetail } from "./MyRecordDetail";

const WEEKDAY_LABELS: Record<WeekStartDay, string[]> = {
  sun: ["일", "월", "화", "수", "목", "금", "토"],
  mon: ["월", "화", "수", "목", "금", "토", "일"],
};

// Same 5-tier scale as the existing /calendar page's CalendarGrid.
function dayStyle(rate: number | null): CSSProperties {
  if (rate === null) return { background: "transparent", color: "var(--color-text-disabled)" };
  if (rate === 0) return { background: "var(--color-bg-warm)", color: "var(--color-text-muted)" };
  if (rate < 40) return { background: "var(--color-pink-100)", color: "var(--color-text-secondary)" };
  if (rate < 70) return { background: "var(--color-peach-300)", color: "var(--color-text-inverse)" };
  if (rate < 100) return { background: "var(--color-pink-400)", color: "var(--color-text-inverse)" };
  return { background: "var(--gradient-primary)", color: "var(--color-text-inverse)" };
}

export function MyRecordsCalendar({
  initialYear,
  initialMonth,
  initialDays,
  initialDetail,
  todayIso,
  weekStartDay,
}: {
  initialYear: number;
  initialMonth: number;
  initialDays: RecordCalendarDay[];
  initialDetail: RecordDetail | null;
  todayIso: string;
  weekStartDay: WeekStartDay;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [days, setDays] = useState(initialDays);
  const [selectedIso, setSelectedIso] = useState(todayIso);
  const [detail, setDetail] = useState(initialDetail);
  const [, startTransition] = useTransition();

  function goToMonth(offset: number) {
    const d = new Date(year, month - 1 + offset, 1);
    const nextYear = d.getFullYear();
    const nextMonth = d.getMonth() + 1;
    setYear(nextYear);
    setMonth(nextMonth);
    startTransition(async () => {
      const nextDays = await getMyRecordsMonthAction(nextYear, nextMonth);
      setDays(nextDays);
    });
  }

  function selectDate(day: RecordCalendarDay) {
    // Future days render with routinePercent: null and aren't selectable.
    if (day.routinePercent === null) return;
    setSelectedIso(day.isoDate);
    startTransition(async () => {
      const nextDetail = await getMyRecordDetailAction(day.isoDate);
      setDetail(nextDetail);
    });
  }

  const firstWeekdaySun = new Date(year, month - 1, 1).getDay();
  const firstWeekday = weekStartDay === "mon" ? (firstWeekdaySun + 6) % 7 : firstWeekdaySun;
  const weekdayLabels = WEEKDAY_LABELS[weekStartDay];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">나의 기록</p>
        <div className="glass-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="이전 달"
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary"
              style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <p className="text-[13px] font-bold tracking-[-0.02em] text-text-primary">
              {year}년 {month}월
            </p>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="다음 달"
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary"
              style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 text-center">
            {weekdayLabels.map((w) => (
              <span key={w} className="font-en text-[10px] font-semibold text-text-muted">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => (
              <button
                key={day.isoDate}
                type="button"
                onClick={() => selectDate(day)}
                disabled={day.routinePercent === null}
                aria-label={`${day.date}일`}
                aria-current={day.isToday ? "date" : undefined}
                className="font-en flex aspect-square items-center justify-center rounded-[var(--radius-sm)] text-[11px] font-semibold disabled:cursor-default"
                style={{
                  ...dayStyle(day.routinePercent),
                  // Thin borders only, and only when they'd otherwise be
                  // indistinguishable — today's ring wins when today is also
                  // the selected date, so there's never a doubled border.
                  outline: day.isToday
                    ? "1.5px solid var(--color-pink-500)"
                    : selectedIso === day.isoDate
                      ? "1.5px solid rgba(86,62,58,0.35)"
                      : "none",
                  outlineOffset: 1,
                }}
              >
                {day.date}
              </button>
            ))}
          </div>
        </div>
      </div>

      {detail && <MyRecordDetail detail={detail} />}
    </section>
  );
}
