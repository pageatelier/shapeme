import type { RoutineDayDetail } from "@/lib/aiRoutine/queries";
import type { WorkoutExercise } from "@/lib/workout/types";

/**
 * Today's AI-generated routine (warmup/workout/cardio/cooldown), or a Rest
 * day state when today's weekday wasn't one the user selected when
 * generating. Only rendered at all when the user has generated at least one
 * AI routine somewhere (see hasAnyAiRoutineSafe) — otherwise a "Rest day"
 * card would appear unexplained for anyone who's never touched this feature.
 */
export function TodayAiRoutineCard({
  detail,
  exercises,
}: {
  detail: RoutineDayDetail | null;
  exercises: WorkoutExercise[];
}) {
  if (!detail) {
    return (
      <div className="glass-card p-5">
        <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">오늘의 AI 루틴</p>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
          오늘은 Rest day예요. 편하게 쉬어가도 괜찮아요 🌿
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">오늘의 AI 루틴 · {detail.title}</p>
      {detail.estimatedMinutes != null && (
        <p className="mt-0.5 text-[11px] text-text-muted">예상 {detail.estimatedMinutes}분</p>
      )}

      <div className="mt-3 flex flex-col gap-3 text-[12px]">
        {detail.warmup.length > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">워밍업</p>
            {detail.warmup.map((w, i) => (
              <p key={i} className="text-text-secondary">
                {w.name} · {w.duration_or_reps}
              </p>
            ))}
          </div>
        )}

        {exercises.length > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">운동</p>
            {exercises.map((e) => (
              <p key={e.id} className="text-text-primary">
                {e.name} — {e.targetSets} × {e.targetReps}
              </p>
            ))}
          </div>
        )}

        {detail.cardio && detail.cardio.type !== "none" && detail.cardio.minutes > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">유산소</p>
            <p className="text-text-secondary">
              {detail.cardio.type} · {detail.cardio.minutes}분
              {detail.cardio.intensity ? ` · ${detail.cardio.intensity}` : ""}
            </p>
          </div>
        )}

        {detail.cooldown.length > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">마무리 스트레칭</p>
            {detail.cooldown.map((c, i) => (
              <p key={i} className="text-text-secondary">
                {c.name} · {c.duration_seconds}초 · {c.target_area}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
