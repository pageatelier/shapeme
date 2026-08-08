"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { StartingWeekSummary } from "@/components/onboarding/StartingWeekSummary";
import { applyNextWeek } from "@/lib/review/applyNextWeek";
import type { WeeklyReview } from "@/lib/review/generateWeeklyReview";

export function WeeklyReviewView({ review }: { review: WeeklyReview }) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleApply() {
    setApplying(true);
    setError(null);
    try {
      await applyNextWeek(review.nextWeek);
      setApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/my"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">이번 주 리뷰</h1>
      </div>

      <div className="glass-card flex flex-col gap-4 p-5">
        <p className="text-[14px] font-semibold text-text-primary">{review.summary}</p>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-secondary">잘한 점</p>
          <ul className="flex flex-col gap-1.5">
            {review.wentWell.map((line, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-text-primary">
                🌿 {line}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-secondary">조정할 점</p>
          <ul className="flex flex-col gap-1.5">
            {review.toAdjust.map((line, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-text-primary">
                🌱 {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <StartingWeekSummary days={review.nextWeek} />

      {error && <p className="text-center text-[12px] text-error">{error}</p>}

      {applied ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[13px] font-semibold text-text-primary">다음 주 루틴을 Move에 저장했어요.</p>
          <button
            type="button"
            onClick={() => router.push("/move")}
            className="rounded-full px-6 py-3 text-[13px] font-bold text-text-inverse"
            style={{ background: "var(--gradient-primary)" }}
          >
            Move에서 확인하기
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleApply}
          disabled={applying}
          className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          {applying ? "저장 중..." : "다음 주 시작하기"}
        </button>
      )}
    </div>
  );
}
