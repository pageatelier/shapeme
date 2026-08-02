import { createClient } from "@/lib/supabase/server";
import type { WorkoutExercise, WorkoutRoutine } from "./types";

type RoutineRow = {
  id: string;
  challenge_id: string | null;
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
 * A user's routines with exercises and one day's set-completion.
 *
 * - `challengeId` omitted (undefined): every routine regardless of program.
 * - `challengeId` a string: only that 100-day program's routines.
 * - `challengeId` explicitly `null`: only general routines with no program
 *   attached — used for the default (no active challenge) workout view, so
 *   a finished/archived challenge's old routines don't leak back in.
 */
export async function getRoutines(
  userId: string,
  logDate: string,
  challengeId?: string | null,
): Promise<WorkoutRoutine[]> {
  const supabase = await createClient();

  let routineQuery = supabase
    .from("workout_routines")
    .select("id, challenge_id, name, days, order_index")
    .eq("user_id", userId)
    .order("order_index", { ascending: true });
  if (challengeId) routineQuery = routineQuery.eq("challenge_id", challengeId);
  else if (challengeId === null) routineQuery = routineQuery.is("challenge_id", null);

  const { data: routineRows, error: routineError } = await routineQuery;
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
    logsByExerciseId = new Map(((logRows as SetLogRow[] | null) ?? []).map((r) => [r.exercise_id, r.sets]));
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
    challengeId: r.challenge_id,
    name: r.name,
    days: r.days,
    orderIndex: r.order_index,
    exercises: exercisesByRoutineId.get(r.id) ?? [],
  }));
}

export async function getRoutinesSafe(userId: string, logDate: string, challengeId?: string | null) {
  try {
    return await getRoutines(userId, logDate, challengeId);
  } catch (error) {
    console.error("[workout] getRoutines failed, falling back to empty:", error);
    return [];
  }
}
