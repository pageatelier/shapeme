import { createClient } from "@/lib/supabase/client";
import { createExercise, createRoutine } from "@/lib/workout/mutations";
import { WEEKDAY_EN_TO_KO } from "./types";
import type { AIRoutineWeek } from "./types";

/**
 * Saves a generated week into the existing workout_routines/workout_exercises
 * tables (same createRoutine/createExercise Move's RoutineManager already
 * uses) plus one routine_day_details row per day for the warmup/cardio/
 * cooldown context that doesn't fit that schema. One routine per generated
 * day (days: [thatOneWeekday]) rather than grouping by type — unlike the
 * onboarding mock generator, each day here can have genuinely different
 * exercises, so there's no shared "type" to group by.
 *
 * suggestedIntensity is free text ("가볍게 4~8kg 정도"), not a single
 * number, so it can't populate workout_exercises.weight_kg (numeric) — it's
 * written into memo instead, alongside the target muscle, so nothing the AI
 * said is lost; Move's ExerciseCard already renders memo text as-is.
 */
export async function saveWeeklyRoutineToMove(week: AIRoutineWeek): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  for (const [orderIndex, day] of week.days.entries()) {
    const routineId = await createRoutine({
      name: day.title,
      days: [WEEKDAY_EN_TO_KO[day.day]],
      orderIndex,
    });

    await Promise.all(
      day.workout.map((exercise, i) =>
        createExercise({
          routineId,
          name: exercise.name,
          targetSets: exercise.sets,
          targetReps: exercise.reps,
          weightKg: null,
          restSeconds: exercise.restSeconds,
          memo: `${exercise.targetMuscle} · ${exercise.suggestedIntensity}`,
          orderIndex: i,
        }),
      ),
    );

    const { error } = await supabase.from("routine_day_details").insert({
      user_id: user.id,
      routine_id: routineId,
      title: day.title,
      estimated_minutes: day.estimatedMinutes,
      warmup: day.warmup.map((w) => ({ name: w.name, duration_or_reps: w.durationOrReps })),
      cooldown: day.cooldown.map((c) => ({
        name: c.name,
        duration_seconds: c.durationSeconds,
        target_area: c.targetArea,
      })),
      cardio: day.cardio,
    });
    if (error) throw error;
  }
}
