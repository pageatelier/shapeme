"use client";

import { WEEKDAY_LABEL_KO } from "@/lib/aiRoutine/types";
import type { AIRoutineWeek } from "@/lib/aiRoutine/types";

/**
 * ⑧ — exercise-level review (warmup/workout/cardio/cooldown), plus ⑨'s
 * Start action. Per-exercise swap and whole-week regenerate are
 * intentionally out of scope for this pass. Shares its day-detail shape
 * with Guide's AiRoutineWeekResult (both render an AIRoutineWeek) — this
 * one keeps the onboarding-specific "Your first week is ready" framing.
 */
export function StartingWeekReview({
  week,
  onStart,
  starting,
  error,
}: {
  week: AIRoutineWeek;
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Your first week is ready.</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
          완벽하게 시작할 필요는 없어요.
          <br />
          이번 주에는 당신에게 잘 맞는 움직임을 함께 찾아볼게요.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {week.days.map((day) => (
          <div key={day.day} className="glass-card p-4">
            <p className="text-[13px] font-bold text-text-primary">
              {WEEKDAY_LABEL_KO[day.day]} · {day.title}
            </p>
            <p className="mb-3 text-[11px] text-text-muted">
              {day.estimatedMinutes}분 · 운동 {day.workout.length}개
            </p>

            <div className="flex flex-col gap-3 text-[12px]">
              <div>
                <p className="mb-1 font-semibold text-text-secondary">워밍업</p>
                {day.warmup.map((w, i) => (
                  <p key={i} className="text-text-secondary">
                    {w.name} · {w.durationOrReps}
                  </p>
                ))}
              </div>

              <div>
                <p className="mb-1 font-semibold text-text-secondary">운동</p>
                {day.workout.map((exercise, i) => (
                  <div key={i} className="mb-1.5">
                    <p className="text-text-primary">
                      {exercise.name} — {exercise.sets} × {exercise.reps}
                    </p>
                    <p className="text-[11px] text-text-muted">Suggested {exercise.suggestedIntensity}</p>
                  </div>
                ))}
              </div>

              {day.cardio.type !== "none" && day.cardio.minutes > 0 && (
                <div>
                  <p className="mb-1 font-semibold text-text-secondary">유산소</p>
                  <p className="text-text-secondary">
                    {day.cardio.type} · {day.cardio.minutes}분
                    {day.cardio.intensity ? ` · ${day.cardio.intensity}` : ""}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-1 font-semibold text-text-secondary">마무리 스트레칭</p>
                {day.cooldown.map((c, i) => (
                  <p key={i} className="text-text-secondary">
                    {c.name} · {c.durationSeconds}초 · {c.targetArea}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-text-muted">
        시작 무게는 가이드예요. 실제 운동하면서 편하게 조절할 수 있어요.
      </p>

      {error && <p className="text-center text-[12px] text-error">{error}</p>}

      <button
        type="button"
        onClick={onStart}
        disabled={starting}
        className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
      >
        {starting ? "저장 중..." : "Start my week"}
      </button>
    </div>
  );
}
