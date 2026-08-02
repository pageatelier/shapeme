import { todayIsoDate } from "@/lib/body/date";
import { createClient } from "@/lib/supabase/client";
import { addDays } from "./date";
import { buildProgramTemplate } from "./templates";
import type { ChallengeSetupInput, WorkoutEffort } from "./types";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");
  return { supabase, user };
}

export async function createChallengeWithProgram(input: ChallengeSetupInput) {
  const { supabase, user } = await requireUser();
  const startDate = todayIsoDate();
  const endDate = addDays(startDate, 99);

  const { error: archiveError } = await supabase
    .from("challenges")
    .update({ status: "archived" })
    .eq("user_id", user.id)
    .eq("status", "active");
  if (archiveError) throw archiveError;

  const { data: challengeRow, error: challengeError } = await supabase
    .from("challenges")
    .insert({
      user_id: user.id,
      goal: input.goal,
      height_cm: input.heightCm,
      start_weight_kg: input.startWeightKg,
      experience_level: input.experienceLevel,
      workout_days_per_week: input.workoutDaysPerWeek,
      session_minutes: input.sessionMinutes,
      workout_location: input.workoutLocation,
      equipment: input.equipment,
      limitations: input.limitations.trim() || null,
      start_date: startDate,
      end_date: endDate,
      status: "active",
    })
    .select("id")
    .single();
  if (challengeError) throw challengeError;

  const challengeId = (challengeRow as { id: string }).id;
  const templates = buildProgramTemplate(input);

  for (let routineIndex = 0; routineIndex < templates.length; routineIndex++) {
    const routine = templates[routineIndex];
    const { data: routineRow, error: routineError } = await supabase
      .from("workout_routines")
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        name: routine.name,
        days: [],
        order_index: routineIndex,
      })
      .select("id")
      .single();
    if (routineError) throw routineError;

    const routineId = (routineRow as { id: string }).id;
    const { error: exercisesError } = await supabase.from("workout_exercises").insert(
      routine.exercises.map((exercise, exerciseIndex) => ({
        user_id: user.id,
        routine_id: routineId,
        name: exercise.name,
        target_sets: exercise.targetSets,
        target_reps: exercise.targetReps,
        weight_kg: exercise.weightKg,
        rest_seconds: exercise.restSeconds,
        memo: exercise.memo,
        order_index: exerciseIndex,
      })),
    );
    if (exercisesError) throw exercisesError;
  }

  return challengeId;
}

export async function saveRecoveryDay({
  challengeId,
  date,
  reason,
}: {
  challengeId: string;
  date: string;
  reason: string;
}) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("challenge_day_logs").upsert(
    {
      user_id: user.id,
      challenge_id: challengeId,
      log_date: date,
      status: "recovery",
      routine_id: null,
      recovery_reason: reason,
      effort: null,
      pain: reason === "pain",
      completed_sets: 0,
      total_sets: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "challenge_id,log_date" },
  );
  if (error) throw error;
}

export async function saveWorkoutCompletion({
  challengeId,
  date,
  routineId,
  effort,
  pain,
  completedSets,
  totalSets,
}: {
  challengeId: string;
  date: string;
  routineId: string;
  effort: WorkoutEffort;
  pain: boolean;
  completedSets: number;
  totalSets: number;
}) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("challenge_day_logs").upsert(
    {
      user_id: user.id,
      challenge_id: challengeId,
      log_date: date,
      status: "workout",
      routine_id: routineId,
      recovery_reason: null,
      effort,
      pain,
      completed_sets: completedSets,
      total_sets: totalSets,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "challenge_id,log_date" },
  );
  if (error) throw error;
}

export async function clearChallengeDayLog(challengeId: string, date: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("challenge_day_logs")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("log_date", date);
  if (error) throw error;
}
