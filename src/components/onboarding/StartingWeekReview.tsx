"use client";

import type { ExerciseDayType } from "@/lib/onboarding/exercises";
import type { StartingWeekDay } from "@/lib/onboarding/generateStartingWeek";

const WEEKDAY_FULL_NAME: Record<string, string> = {
  월: "Monday",
  화: "Tuesday",
  수: "Wednesday",
  목: "Thursday",
  금: "Friday",
  토: "Saturday",
  일: "Sunday",
};

const DAY_TYPE_FULL_LABEL: Record<ExerciseDayType, string> = {
  lower: "Lower Body",
  upper: "Upper Body",
  full_body: "Full Body",
};

/**
 * ⑧ — exercise-level review, plus ⑨'s Start action. Per-exercise swap and
 * whole-week regenerate are intentionally out of scope for this pass (the
 * MVP goal is just "recommended week saves to Move and is usable") — can be
 * reintroduced later without touching this component's core shape.
 */
export function StartingWeekReview({
  days,
  onStart,
  starting,
  error,
}: {
  days: StartingWeekDay[];
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  const workoutDays = days.filter((d): d is StartingWeekDay & { dayType: ExerciseDayType } => d.dayType !== "rest");

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
        {workoutDays.map((day) => (
          <div key={day.weekday} className="glass-card p-4">
            <p className="text-[13px] font-bold text-text-primary">
              {WEEKDAY_FULL_NAME[day.weekday]} · {DAY_TYPE_FULL_LABEL[day.dayType]}
            </p>
            <p className="mb-3 text-[11px] text-text-muted">
              {[day.label.split(" · ")[1], `${day.minutes} min`, `${day.exercises.length} exercises`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <div className="flex flex-col gap-2">
              {day.exercises.map((exercise, i) => (
                <div key={`${exercise.name}-${i}`}>
                  <p className="truncate text-[13px] text-text-primary">
                    {exercise.name} — {exercise.targetSets} × {exercise.targetReps}
                  </p>
                  {exercise.suggestedWeightKg != null && (
                    <p className="text-[11px] text-text-muted">Suggested {exercise.suggestedWeightKg} kg</p>
                  )}
                </div>
              ))}
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
        {starting ? "저장 중..." : "Start my week ♡"}
      </button>
    </div>
  );
}
