"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { BodyThumb } from "@/components/body/BodyThumb";
import { RECOVERY_REASON_LABELS } from "@/lib/challenge/types";
import type { CalendarDay, CalendarStatus } from "@/lib/calendar/types";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function dayStyle(status: CalendarStatus): CSSProperties {
  if (status === "future") return { background: "transparent", color: "var(--color-text-disabled)" };
  if (status === "workout") return { background: "var(--gradient-primary)", color: "var(--color-text-inverse)" };
  if (status === "recovery") return { background: "var(--color-lilac)", color: "var(--color-text-secondary)" };
  if (status === "partial") return { background: "var(--color-peach-200)", color: "var(--color-text-secondary)" };
  return { background: "var(--color-bg-warm)", color: "var(--color-text-muted)" };
}

const statusLabel: Record<CalendarStatus, string> = {
  future: "아직 오지 않은 날",
  workout: "운동 완료",
  recovery: "회복일",
  partial: "운동 진행 중",
  empty: "기록 없음",
};

export function CalendarGrid({ days, firstWeekday }: { days: CalendarDay[]; firstWeekday: number }) {
  const todayEntry = days.find((day) => day.isToday);
  const [selectedIso, setSelectedIso] = useState(todayEntry?.isoDate ?? days[0]?.isoDate ?? null);
  const selectedDay = days.find((day) => day.isoDate === selectedIso) ?? null;

  return (
    <>
      <div className="glass-card p-4">
        <div className="mb-2 grid grid-cols-7 text-center">
          {weekdayLabels.map((weekday) => <span key={weekday} className="font-en text-[10px] font-semibold text-text-muted">{weekday}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }).map((_, index) => <div key={`pad-${index}`} />)}
          {days.map((day) => (
            <button key={day.isoDate} type="button" onClick={() => setSelectedIso(day.isoDate)} className="relative font-en flex aspect-square items-center justify-center rounded-[10px] text-[12px] font-semibold" style={{ ...dayStyle(day.status), outline: day.isToday ? "2px solid var(--color-pink-500)" : selectedIso === day.isoDate ? "2px solid rgba(86,62,58,0.28)" : "none", outlineOffset: 1 }}>
              {day.date}
              {day.body && <span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-white/90" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-text-muted">
        <LegendDot style={{ background: "var(--gradient-primary)" }} label="운동 완료" />
        <LegendDot style={{ background: "var(--color-lilac)" }} label="회복일" />
        <LegendDot style={{ background: "var(--color-peach-200)" }} label="진행 중" />
        <LegendDot style={{ background: "var(--color-bg-warm)" }} label="기록 없음" />
      </div>

      {selectedDay && (
        <section className="surface-card p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-[14px] font-bold text-text-primary">{Number(selectedDay.isoDate.slice(5, 7))}월 {selectedDay.date}일</p>
              {selectedDay.challengeDay && <p className="font-en mt-0.5 text-[10px] font-semibold tracking-[0.08em] text-pink-500 uppercase">Day {selectedDay.challengeDay}</p>}
            </div>
            <span className="rounded-full px-3 py-1 text-[10px] font-semibold text-text-secondary" style={{ background: dayStyle(selectedDay.status).background }}>{statusLabel[selectedDay.status]}</span>
          </div>

          {selectedDay.status === "workout" && <p className="mb-4 text-[12px] leading-relaxed text-text-secondary">{selectedDay.routineName ?? "운동"} · {selectedDay.completedSets}/{selectedDay.totalSets}세트 완료</p>}
          {selectedDay.status === "partial" && <p className="mb-4 text-[12px] text-text-secondary">{selectedDay.completedSets}/{selectedDay.totalSets}세트까지 진행했어요.</p>}
          {selectedDay.status === "recovery" && <p className="mb-4 text-[12px] text-text-secondary">{selectedDay.recoveryReason ? RECOVERY_REASON_LABELS[selectedDay.recoveryReason] ?? "회복이 필요했던 날이에요." : "회복이 필요했던 날이에요."}</p>}

          <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase">Body record</p>
          {selectedDay.body ? (
            <Link href={`/body/${selectedDay.body.date}`} className="flex gap-3">
              <BodyThumb slot="front" filled={selectedDay.body.front} imageUrl={selectedDay.body.frontImageUrl} size={48} />
              <BodyThumb slot="side" filled={selectedDay.body.side} imageUrl={selectedDay.body.sideImageUrl} size={48} />
              <BodyThumb slot="back" filled={selectedDay.body.back} imageUrl={selectedDay.body.backImageUrl} size={48} />
            </Link>
          ) : <p className="text-xs text-text-muted">기록된 눈바디 사진이 없어요.</p>}

          {selectedDay.memo && <><p className="font-en mt-4 mb-2 text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase">Memo</p><p className="text-[13px] leading-relaxed text-text-secondary">{selectedDay.memo}</p></>}
        </section>
      )}
    </>
  );
}

function LegendDot({ style, label }: { style: CSSProperties; label: string }) {
  return <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={style} />{label}</span>;
}
