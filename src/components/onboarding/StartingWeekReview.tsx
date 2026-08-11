"use client";

import type { StartingWeight } from "@/lib/onboarding/exercises";
import type { StartingWeekDay } from "@/lib/onboarding/generateStartingWeek";

/** Turns the structured StartingWeight into display copy — the data itself
 * stays structured (see exercises.ts's StartingWeight doc) so this is the
 * one place that has to know how to phrase each variant. */
function formatStartingWeight(weight: StartingWeight): string {
  switch (weight.type) {
    case "weight_range":
      return weight.perHand
        ? `${weight.minKg}–${weight.maxKg} kg each`
        : `${weight.minKg}–${weight.maxKg} kg`;
    case "bodyweight":
      return "Bodyweight";
    case "lightest_available":
      return "Lightest available";
    case "light_band":
      return "Light band";
    case "high_assistance":
      return "High assistance";
  }
}

/**
 * ⑦ — Starting Week output. Read-only in this phase: no Edit/Replace/Not
 * available/Remove or Add/Reorder/Change day/Change duration yet — those
 * are Phase 2's editable review, deliberately scoped out of the generator
 * phase so the generator itself can be validated on its own first.
 */
export function StartingWeekReview({
  week,
  onStart,
  starting,
  error,
}: {
  week: StartingWeekDay[];
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  const workoutDays = week.filter((day) => day.dayType !== "rest");

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
        {week.map((day) => (
          <div key={day.weekday} className="glass-card p-4">
            <p className="text-[13px] font-bold text-text-primary">
              {day.weekday} · {day.label}
            </p>

            {day.dayType === "rest" ? (
              <p className="text-[12px] text-text-muted">Rest / gentle movement</p>
            ) : (
              <>
                <p className="mb-3 text-[11px] text-text-muted">
                  {day.minutes}분 · 운동 {day.exercises.length}개
                </p>

                <div className="flex flex-col gap-3 text-[12px]">
                  {day.warmup.length > 0 && (
                    <div>
                      <p className="mb-1 font-semibold text-text-secondary">워밍업</p>
                      {day.warmup.map((w) => (
                        <p key={w} className="text-text-secondary">
                          {w}
                        </p>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="mb-1 font-semibold text-text-secondary">운동</p>
                    {day.exercises.map((exercise) => (
                      <div key={exercise.name} className="mb-1.5">
                        <p className="text-text-primary">
                          {exercise.name} — {exercise.targetSets} × {exercise.repsMin}–{exercise.repsMax}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          Suggested start: {formatStartingWeight(exercise.startingWeight)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {workoutDays.length === 0 && (
        <p className="text-center text-[12px] text-error">
          이번 주 운동일이 없어요. 이전 단계로 돌아가 요일을 선택해주세요.
        </p>
      )}

      <p className="text-center text-[11px] text-text-muted">
        시작 무게는 가이드예요. 실제 운동하면서 편하게 조절할 수 있어요.
      </p>

      {error && <p className="text-center text-[12px] text-error">{error}</p>}

      <button
        type="button"
        onClick={onStart}
        disabled={starting || workoutDays.length === 0}
        className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
      >
        {starting ? "저장 중..." : "Start my week"}
      </button>
    </div>
  );
}
