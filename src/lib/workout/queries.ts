import { createClient } from "@/lib/supabase/server";
import type { WorkoutExercise, WorkoutRoutine } from "./types";

type RoutineRow = {
  id: string;
  name: string;
  days: string[];
  order_index: number;
};

type ExerciseRow = {
  id: string;
  routine_id: string;
  name: string;
  target_sets: number;
  target_reps: number;
  weight_kg: number | null;
  rest_seconds: number | null;
  memo: string | null;
  order_index: number;
};

type SetLogRow = {
  exercise_id: string;
  sets: boolean[];
};

function normalizeSets(sets: boolean[] | undefined, targetSets: number): boolean[] {
  const base = sets ?? [];
  return Array.from({ length: targetSets }, (_, i) => base[i] ?? false);
}

/**
 * All of a user's routines with their exercises and that day's
 * set-completion filled in, ordered by order_index. `logDate` defaults to
 * today when omitted by the caller.
 */
export async function getRoutines(userId: string, logDate: string): Promise<WorkoutRoutine[]> {
  const supabase = await createClient();

  const { data: routineRows, error: routineError } = await supabase
    .from("workout_routines")
    .select("id, name, days, order_index")
    .eq("user_id", userId)
    .order("order_index", { ascending: true });
  if (routineError) throw routineError;

  const routines = (routineRows ?? []) as RoutineRow[];
  if (routines.length === 0) return [];

  const routineIds = routines.map((r) => r.id);

  const { data: exerciseRows, error: exerciseError } = await supabase
    .from("workout_exercises")
    .select("id, routine_id, name, target_sets, target_reps, weight_kg, rest_seconds, memo, order_index")
    .in("routine_id", routineIds)
    .order("order_index", { ascending: true });
  if (exerciseError) throw exerciseError;

  const exercises = (exerciseRows ?? []) as ExerciseRow[];
  const exerciseIds = exercises.map((e) => e.id);

  let logsByExerciseId = new Map<string, boolean[]>();
  if (exerciseIds.length > 0) {
    const { data: logRows, error: logError } = await supabase
      .from("workout_set_logs")
      .select("exercise_id, sets")
      .eq("log_date", logDate)
      .in("exercise_id", exerciseIds);
    if (logError) throw logError;
    logsByExerciseId = new Map((logRows as SetLogRow[] | null ?? []).map((r) => [r.exercise_id, r.sets]));
  }

  const exercisesByRoutineId = new Map<string, WorkoutExercise[]>();
  for (const e of exercises) {
    const exercise: WorkoutExercise = {
      id: e.id,
      routineId: e.routine_id,
      name: e.name,
      targetSets: e.target_sets,
      targetReps: e.target_reps,
      weightKg: e.weight_kg,
      restSeconds: e.rest_seconds,
      memo: e.memo,
      orderIndex: e.order_index,
      sets: normalizeSets(logsByExerciseId.get(e.id), e.target_sets),
    };
    const bucket = exercisesByRoutineId.get(e.routine_id);
    if (bucket) bucket.push(exercise);
    else exercisesByRoutineId.set(e.routine_id, [exercise]);
  }

  return routines.map((r) => ({
    id: r.id,
    name: r.name,
    days: r.days,
    orderIndex: r.order_index,
    exercises: exercisesByRoutineId.get(r.id) ?? [],
  }));
}

/** Same as getRoutines, but resolves to [] instead of throwing — used on pages that must still render if the workout migration (supabase/migrations/0002_workout.sql) hasn't been applied yet. */
export async function getRoutinesSafe(userId: string, logDate: string): Promise<WorkoutRoutine[]> {
  try {
    return await getRoutines(userId, logDate);
  } catch (error) {
    console.error("[workout] getRoutines failed, falling back to empty:", error);
    return [];
  }
}

/** Total Move records for My page's "전체 기록 개수" — a "record" is a
 * distinct day that has at least one checked set logged, across any of
 * the user's routines. */
export async function getMoveRecordCountSafe(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    const { data: routineRows, error: routineError } = await supabase
      .from("workout_routines")
      .select("id")
      .eq("user_id", userId);
    if (routineError) throw routineError;

    const routineIds = (routineRows ?? []).map((r) => r.id as string);
    if (routineIds.length === 0) return 0;

    const { data: exerciseRows, error: exerciseError } = await supabase
      .from("workout_exercises")
      .select("id")
      .in("routine_id", routineIds);
    if (exerciseError) throw exerciseError;

    const exerciseIds = (exerciseRows ?? []).map((e) => e.id as string);
    if (exerciseIds.length === 0) return 0;

    const { data: logRows, error: logError } = await supabase
      .from("workout_set_logs")
      .select("log_date, sets")
      .in("exercise_id", exerciseIds);
    if (logError) throw logError;

    const recordedDates = new Set(
      (logRows as { log_date: string; sets: boolean[] }[] | null ?? [])
        .filter((row) => row.sets?.some(Boolean))
        .map((row) => row.log_date),
    );
    return recordedDates.size;
  } catch (error) {
    console.error("[workout] getMoveRecordCount failed:", error);
    return 0;
  }
}
