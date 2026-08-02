import { createClient } from "@/lib/supabase/server";
import type { Challenge, ChallengeDayLog } from "./types";

type ChallengeRow = {
  id: string;
  goal: Challenge["goal"];
  height_cm: number | null;
  start_weight_kg: number | null;
  experience_level: Challenge["experienceLevel"];
  workout_days_per_week: number;
  session_minutes: number;
  workout_location: Challenge["workoutLocation"];
  equipment: string[] | null;
  limitations: string | null;
  start_date: string;
  end_date: string;
  status: Challenge["status"];
};

type DayLogRow = {
  id: string;
  challenge_id: string;
  log_date: string;
  status: ChallengeDayLog["status"];
  routine_id: string | null;
  recovery_reason: string | null;
  effort: ChallengeDayLog["effort"];
  pain: boolean;
  completed_sets: number;
  total_sets: number;
  workout_routines: { name: string } | { name: string }[] | null;
};

function mapChallenge(row: ChallengeRow): Challenge {
  return {
    id: row.id,
    goal: row.goal,
    heightCm: row.height_cm,
    startWeightKg: row.start_weight_kg,
    experienceLevel: row.experience_level,
    workoutDaysPerWeek: row.workout_days_per_week,
    sessionMinutes: row.session_minutes,
    workoutLocation: row.workout_location,
    equipment: row.equipment ?? [],
    limitations: row.limitations,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
  };
}

function mapDayLog(row: DayLogRow): ChallengeDayLog {
  const relation = Array.isArray(row.workout_routines) ? row.workout_routines[0] : row.workout_routines;
  return {
    id: row.id,
    challengeId: row.challenge_id,
    logDate: row.log_date,
    status: row.status,
    routineId: row.routine_id,
    routineName: relation?.name ?? null,
    recoveryReason: row.recovery_reason,
    effort: row.effort,
    pain: row.pain,
    completedSets: row.completed_sets,
    totalSets: row.total_sets,
  };
}

export async function getActiveChallenge(userId: string): Promise<Challenge | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("id, goal, height_cm, start_weight_kg, experience_level, workout_days_per_week, session_minutes, workout_location, equipment, limitations, start_date, end_date, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapChallenge(data as ChallengeRow) : null;
}

export async function getActiveChallengeSafe(userId: string) {
  try {
    return await getActiveChallenge(userId);
  } catch (error) {
    console.error("[challenge] getActiveChallenge failed:", error);
    return null;
  }
}

export async function getChallengeDayLogs(
  userId: string,
  challengeId: string,
  start?: string,
  end?: string,
): Promise<ChallengeDayLog[]> {
  const supabase = await createClient();
  let query = supabase
    .from("challenge_day_logs")
    .select("id, challenge_id, log_date, status, routine_id, recovery_reason, effort, pain, completed_sets, total_sets, workout_routines(name)")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .order("log_date", { ascending: true });
  if (start) query = query.gte("log_date", start);
  if (end) query = query.lte("log_date", end);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as DayLogRow[]).map(mapDayLog);
}

export async function getChallengeDayLogsSafe(
  userId: string,
  challengeId: string,
  start?: string,
  end?: string,
) {
  try {
    return await getChallengeDayLogs(userId, challengeId, start, end);
  } catch (error) {
    console.error("[challenge] getChallengeDayLogs failed:", error);
    return [];
  }
}
