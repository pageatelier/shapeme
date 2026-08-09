"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveWeeklyRoutineToMove } from "@/lib/aiRoutine/saveWeeklyRoutine";
import { WEEKDAY_LABEL_KO } from "@/lib/aiRoutine/types";
import type { AIRoutineWeek } from "@/lib/aiRoutine/types";

/** Full generated week — warmup/workout/cardio/cooldown per day — plus the
 * "Move에 저장" action. Read-only display; no per-exercise swap or
 * regenerate here (same MVP scope as the onboarding review screen). */
export function AiRoutineWeekResult({ week }: { week: AIRoutineWeek }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveWeeklyRoutineToMove(week);
      setSaved(true);
      // Move/settings fetches routines server-side — without this, navigating
      // there right after saving can show a stale pre-save RSC cache (the
      // exact "루틴이 없어" caching issue diagnosed earlier this session).
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] font-bold text-text-primary">
        주 {week.frequency}회 · {week.workoutDays.map((d) => WEEKDAY_LABEL_KO[d]).join(", ")}
      </p>

      <div className="flex flex-col gap-3">
        {week.days.map((day) => (
          <div key={day.day} className="surface-card p-4">
            <p className="text-[13px] font-bold text-text-primary">
              {WEEKDAY_LABEL_KO[day.day]} · {day.title}
            </p>
            <p className="mb-3 text-[11px] text-text-muted">{day.estimatedMinutes}분</p>

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
                {day.workout.map((w, i) => (
                  <div key={i} className="mb-1.5">
                    <p className="text-text-primary">
                      {w.name} — {w.sets} × {w.reps}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {w.targetMuscle} · {w.suggestedIntensity} · 휴식 {w.restSeconds}초
                    </p>
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

      {error && <p className="text-center text-[12px] text-error">{error}</p>}

      {saved ? (
        <p className="text-center text-[13px] font-semibold text-text-primary">Move에 저장했어요</p>
      ) : (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex min-h-[48px] items-center justify-center rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? "저장 중..." : "Move에 저장"}
        </button>
      )}
    </div>
  );
}
