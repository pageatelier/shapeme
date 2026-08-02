"use client";

import Link from "next/link";
import { todayIsoDate } from "@/lib/body/date";
import type { BodyEntry } from "@/lib/body/types";
import { PhotoSlotButton } from "./PhotoSlotButton";

export function TodayBodyCard({ entry, challengeDay }: { entry: BodyEntry | null; challengeDay?: number }) {
  const today = todayIsoDate();
  const hasAny = !!entry && (entry.front || entry.side || entry.back);

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-en text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
          today&apos;s body{challengeDay ? ` · day ${challengeDay}` : ""}
        </p>
        <Link href="/body" className="font-en text-[11px] font-semibold text-text-muted lowercase">
          전체 보기
        </Link>
      </div>

      {!hasAny && (
        <p className="mb-4 text-center text-[13px] text-text-secondary">오늘의 나를 기록해보세요.</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <PhotoSlotButton slot="front" date={today} filled={!!entry?.front} imageUrl={entry?.frontImageUrl} />
        <PhotoSlotButton slot="side" date={today} filled={!!entry?.side} imageUrl={entry?.sideImageUrl} />
        <PhotoSlotButton slot="back" date={today} filled={!!entry?.back} imageUrl={entry?.backImageUrl} />
      </div>
    </div>
  );
}
