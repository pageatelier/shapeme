import { createClient } from "@/lib/supabase/server";
import type { MovementActivityType, MovementLog } from "./types";

type Row = {
  id: string;
  log_date: string;
  activity_type: string;
  duration_minutes: number;
  distance_km: number | null;
  steps: number | null;
  calories: number | null;
  memo: string | null;
};

const COLUMNS = "id, log_date, activity_type, duration_minutes, distance_km, steps, calories, memo";

function toLog(row: Row): MovementLog {
  return {
    id: row.id,
    date: row.log_date,
    activityType: row.activity_type as MovementActivityType,
    durationMinutes: row.duration_minutes,
    distanceKm: row.distance_km,
    steps: row.steps,
    calories: row.calories,
    memo: row.memo,
  };
}

export async function getMovementLogsByDate(userId: string, date: string): Promise<MovementLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movement_logs")
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("log_date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as Row[]).map(toLog);
}

export async function getMovementLogsByDateSafe(userId: string, date: string): Promise<MovementLog[]> {
  try {
    return await getMovementLogsByDate(userId, date);
  } catch (error) {
    console.error("[movement] getMovementLogsByDate failed, falling back to empty:", error);
    return [];
  }
}
