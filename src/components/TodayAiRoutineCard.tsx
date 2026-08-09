import type { RoutineDayDetail } from "@/lib/aiRoutine/queries";
import { todayCopy } from "@/lib/copy/today";
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
        <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">{todayCopy.aiRoutine.restTitle}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{todayCopy.aiRoutine.restBody}</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">
        {todayCopy.aiRoutine.titlePrefix} · {detail.title}
      </p>
      {detail.estimatedMinutes != null && (
        <p className="mt-0.5 text-[11px] text-text-muted">{todayCopy.aiRoutine.estimated(detail.estimatedMinutes)}</p>
      )}

      <div className="mt-3 flex flex-col gap-3 text-[12px]">
        {detail.warmup.length > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">{todayCopy.aiRoutine.warmup}</p>
            {detail.warmup.map((w, i) => (
              <p key={i} className="text-text-secondary">
                {w.name} · {w.duration_or_reps}
              </p>
            ))}
          </div>
        )}

        {exercises.length > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">{todayCopy.aiRoutine.workout}</p>
            {exercises.map((e) => (
              <p key={e.id} className="text-text-primary">
                {e.name} — {e.targetSets} × {e.targetReps}
              </p>
            ))}
          </div>
        )}

        {detail.cardio && detail.cardio.type !== "none" && detail.cardio.minutes > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">{todayCopy.aiRoutine.cardio}</p>
            <p className="text-text-secondary">
              {detail.cardio.type} · {detail.cardio.minutes} min
              {detail.cardio.intensity ? ` · ${detail.cardio.intensity}` : ""}
            </p>
          </div>
        )}

        {detail.cooldown.length > 0 && (
          <div>
            <p className="mb-1 font-semibold text-text-secondary">{todayCopy.aiRoutine.cooldown}</p>
            {detail.cooldown.map((c, i) => (
              <p key={i} className="text-text-secondary">
                {c.name} · {c.duration_seconds}s · {c.target_area}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
