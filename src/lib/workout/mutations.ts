import { createClient } from "@/lib/supabase/client";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");
  return { supabase, userId: user.id };
}

export async function createRoutine({
  name,
  days,
  orderIndex,
}: {
  name: string;
  days: string[];
  orderIndex: number;
}): Promise<string> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("workout_routines")
    .insert({ user_id: userId, name, days, order_index: orderIndex })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateRoutine(
  id: string,
  patch: { name?: string; days?: string[] },
) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("workout_routines").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteRoutine(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("workout_routines").delete().eq("id", id);
  if (error) throw error;
}

export type ExerciseInput = {
  routineId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  weightKg: number | null;
  restSeconds: number | null;
  memo: string | null;
  orderIndex: number;
};

export async function createExercise(input: ExerciseInput): Promise<string> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("workout_exercises")
    .insert({
      user_id: userId,
      routine_id: input.routineId,
      name: input.name,
      target_sets: input.targetSets,
      target_reps: input.targetReps,
      weight_kg: input.weightKg,
      rest_seconds: input.restSeconds,
      memo: input.memo,
      order_index: input.orderIndex,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateExercise(
  id: string,
  patch: Partial<{
    name: string;
    targetSets: number;
    targetReps: number;
    weightKg: number | null;
    restSeconds: number | null;
    memo: string | null;
  }>,
) {
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("workout_exercises")
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.targetSets !== undefined && { target_sets: patch.targetSets }),
      ...(patch.targetReps !== undefined && { target_reps: patch.targetReps }),
      ...(patch.weightKg !== undefined && { weight_kg: patch.weightKg }),
      ...(patch.restSeconds !== undefined && { rest_seconds: patch.restSeconds }),
      ...(patch.memo !== undefined && { memo: patch.memo }),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteExercise(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("workout_exercises").delete().eq("id", id);
  if (error) throw error;
}

/** Swaps two exercises' order_index so they trade places in the list. */
export async function swapExerciseOrder(
  a: { id: string; orderIndex: number },
  b: { id: string; orderIndex: number },
) {
  const { supabase } = await requireUserId();
  const { error: firstError } = await supabase
    .from("workout_exercises")
    .update({ order_index: b.orderIndex })
    .eq("id", a.id);
  if (firstError) throw firstError;

  const { error: secondError } = await supabase
    .from("workout_exercises")
    .update({ order_index: a.orderIndex })
    .eq("id", b.id);
  if (secondError) throw secondError;
}

export async function saveSetLog({
  exerciseId,
  date,
  sets,
}: {
  exerciseId: string;
  date: string;
  sets: boolean[];
}) {
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase.from("workout_set_logs").upsert(
    {
      user_id: userId,
      exercise_id: exerciseId,
      log_date: date,
      sets,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "exercise_id,log_date" },
  );
  if (error) throw error;
}
