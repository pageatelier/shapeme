import { createExercise, createRoutine } from "@/lib/workout/mutations";
import type { ExerciseDayType } from "./exercises";
import type { StartingWeekDay } from "./generateStartingWeek";

const ROUTINE_NAME: Record<ExerciseDayType, string> = {
  lower: "Lower Body",
  upper: "Upper Body",
  full_body: "Full Body",
};

/**
 * ⑨ "Start my week" — saves the reviewed week into workout_routines /
 * workout_exercises, the same tables Move's RoutineManager writes to, so
 * the result shows up there exactly like a hand-built routine would.
 *
 * workout_routines models "same exercises every day it's scheduled" (one
 * exercise list shared across all of a routine's days) — but this generator
 * varies exercises a little across repeated occurrences of the same day
 * type (e.g. Monday Lower vs Thursday Lower) for a livelier preview. That
 * variety doesn't survive the save: one routine is created per day type
 * present in the week, using its *first* occurrence's exercise list for
 * every day of that type. Rest days are skipped entirely.
 */
export async function saveStartingWeekToMove(days: StartingWeekDay[]): Promise<void> {
  const workoutDays = days.filter((d) => d.dayType !== "rest") as (StartingWeekDay & { dayType: ExerciseDayType })[];
  if (workoutDays.length === 0) return;

  const occurrencesByType = new Map<ExerciseDayType, (StartingWeekDay & { dayType: ExerciseDayType })[]>();
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
        targetReps: exercise.targetReps,
        weightKg: exercise.suggestedWeightKg,
        restSeconds: null,
        memo: null,
        orderIndex,
      }),
    ),
  );
  await Promise.all(exerciseCreates);
}
