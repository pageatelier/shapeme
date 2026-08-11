import { createExercise, createRoutine } from "@/lib/workout/mutations";
import type { StartingWeight } from "./exercises";
import type { WorkoutType } from "./exercises";
import type { StartingWeekDay, StartingWeekExercise } from "./generateStartingWeek";

const ROUTINE_NAME: Record<WorkoutType, string> = {
  full_body: "Full Body",
  lower_body: "Lower Body",
  glutes: "Glutes",
  upper_body: "Upper Body",
  back_shoulders: "Back & Shoulders",
  arms_shoulders: "Arms & Shoulders",
  core_waist: "Core & Waist",
};

/** workout_exercises still stores a single numeric weight (or null) —
 * `weightKg` takes the *lower* end of a suggested range, matching the
 * "Suggested start" framing (the UI shows the low end; once the user logs
 * a real set, the existing last-used-weight display takes over from this
 * one-time seed value). Non-numeric weight types (bodyweight, band, machine
 * assistance) have no meaningful kg value, same as the old generator's
 * `suggestedWeightKg: null` for bodyweight moves. */
function seedWeightKg(weight: StartingWeight): number | null {
  return weight.type === "weight_range" ? weight.minKg : null;
}

/** workout_exercises stores a single target rep count — the lower end of
 * the suggested range, same "start conservative" framing as the weight. */
function seedTargetReps(exercise: StartingWeekExercise): number {
  return exercise.repsMin;
}

/**
 * "Use this starting week" — saves the reviewed week into workout_routines
 * / workout_exercises, the same tables Move's RoutineManager writes to, so
 * the result shows up there exactly like a hand-built routine would.
 *
 * workout_routines models "same exercises every day it's scheduled" (one
 * exercise list shared across all of a routine's days) — but the generator
 * can vary exercises a little across repeated occurrences of the same
 * workout type in a week (e.g. Monday Glutes vs a later Glutes day). That
 * variety doesn't survive the save: one routine is created per workout type
 * present in the week, using its *first* occurrence's exercise list for
 * every day of that type. Rest days are skipped entirely.
 */
export async function saveStartingWeekToMove(days: StartingWeekDay[]): Promise<void> {
  const workoutDays = days.filter((d) => d.dayType !== "rest") as (StartingWeekDay & { dayType: WorkoutType })[];
  // Every daysPerWeek option (2–5) always schedules at least one workout
  // day, so this should be unreachable — throwing instead of silently
  // no-op'ing means a real bug here surfaces as an error on the review
  // screen instead of a "successful" save that created nothing.
  if (workoutDays.length === 0) {
    throw new Error("The generated routine has no workout days. Please try again.");
  }

  const occurrencesByType = new Map<WorkoutType, (StartingWeekDay & { dayType: WorkoutType })[]>();
  for (const day of workoutDays) {
    const bucket = occurrencesByType.get(day.dayType);
    if (bucket) bucket.push(day);
    else occurrencesByType.set(day.dayType, [day]);
  }

  const routineEntries = [...occurrencesByType.entries()];
  const routineIds = await Promise.all(
    routineEntries.map(([dayType, occurrences], orderIndex) =>
      createRoutine({
        name: ROUTINE_NAME[dayType],
        days: occurrences.map((o) => o.weekday),
        orderIndex,
      }),
    ),
  );

  const exerciseCreates = routineEntries.flatMap(([, occurrences], i) =>
    occurrences[0].exercises.map((exercise, orderIndex) =>
      createExercise({
        routineId: routineIds[i],
        name: exercise.name,
        targetSets: exercise.targetSets,
        targetReps: seedTargetReps(exercise),
        weightKg: seedWeightKg(exercise.startingWeight),
        restSeconds: null,
        memo: null,
        orderIndex,
      }),
    ),
  );
  await Promise.all(exerciseCreates);
}
