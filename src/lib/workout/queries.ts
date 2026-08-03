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

  // All three tables carry their own user_id (RLS-scoped individually), so
  // they can be fetched in parallel instead of chaining routine ids into the
  // exercise query and exercise ids into the set-log query — that chain was
  // three sequential round trips for data one filter already covers.
  const [routinesResult, exercisesResult, logsResult] = await Promise.all([
    supabase
      .from("workout_routines")
      .select("id, name, days, order_index")
      .eq("user_id", userId)
      .order("order_index", { ascending: true }),
    supabase
      .from("workout_exercises")
      .select("id, routine_id, name, target_sets, target_reps, weight_kg, rest_seconds, memo, order_index")
      .eq("user_id", userId)
      .order("order_index", { ascending: true }),
    supabase
      .from("workout_set_logs")
      .select("exercise_id, sets")
      .eq("user_id", userId)
      .eq("log_date", logDate),
  ]);
  if (routinesResult.error) throw routinesResult.error;
  if (exercisesResult.error) throw exercisesResult.error;
  if (logsResult.error) throw logsResult.error;

  const routines = (routinesResult.data ?? []) as RoutineRow[];
  if (routines.length === 0) return [];

  const exercises = (exercisesResult.data ?? []) as ExerciseRow[];
  const logsByExerciseId = new Map(
    ((logsResult.data as SetLogRow[] | null) ?? []).map((r) => [r.exercise_id, r.sets]),
  );

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
 * distinct day with at least one checked strength set OR at least one
 * simple movement_logs entry (running, walking, dance, etc.), across
 * either data source. */
export async function getMoveRecordCountSafe(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    // workout_set_logs and movement_logs both carry their own user_id, so —
    // same as getRoutines above — there's no need to chain through routines
    // and exercises just to reach them.
    const [setLogsResult, movementResult] = await Promise.all([
      supabase.from("workout_set_logs").select("log_date, sets").eq("user_id", userId),
      supabase.from("movement_logs").select("log_date").eq("user_id", userId),
    ]);
    if (setLogsResult.error) throw setLogsResult.error;
    if (movementResult.error) throw movementResult.error;

    const recordedDates = new Set<string>();
    for (const row of (setLogsResult.data as { log_date: string; sets: boolean[] }[] | null) ?? []) {
      if (row.sets?.some(Boolean)) recordedDates.add(row.log_date);
    }
    for (const row of (movementResult.data as { log_date: string }[] | null) ?? []) {
      recordedDates.add(row.log_date);
    }

    return recordedDates.size;
  } catch (error) {
    console.error("[workout] getMoveRecordCount failed:", error);
    return 0;
  }
}
