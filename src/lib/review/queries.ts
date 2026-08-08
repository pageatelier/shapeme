import { addDays } from "@/lib/body/date";
import { createClient } from "@/lib/supabase/server";
import { getDailyMoveSnapshotsInRangeSafe } from "@/lib/workout/queries";

export type WeeklyReviewDay = {
  date: string;
  totalTargetSets: number;
  doneSets: number;
  difficulty: string | null;
  hasMeal: boolean;
};

/**
 * Raw per-day numbers for [start, end] (inclusive), feeding
 * generateWeeklyReview.ts — one row per calendar day, filled with 0s/false
 * for days with no activity rather than being sparse, so the generator
 * doesn't need to handle missing days itself.
 */
export async function getWeeklyReviewData(userId: string, start: string, end: string): Promise<WeeklyReviewDay[]> {
  const supabase = await createClient();

  const [snapshots, setLogsRes, mealRes] = await Promise.all([
    getDailyMoveSnapshotsInRangeSafe(userId, start, end),
    supabase
      .from("workout_set_logs")
      .select("log_date, sets")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", end),
    supabase
      .from("meal_logs")
      .select("meal_date, image_path")
      .eq("user_id", userId)
      .gte("meal_date", start)
      .lte("meal_date", end),
  ]);
  if (setLogsRes.error) throw setLogsRes.error;
  if (mealRes.error) throw mealRes.error;

  const doneByDate = new Map<string, number>();
  for (const row of (setLogsRes.data as { log_date: string; sets: boolean[] }[] | null) ?? []) {
    doneByDate.set(row.log_date, (doneByDate.get(row.log_date) ?? 0) + row.sets.filter(Boolean).length);
  }

  const mealDates = new Set(
    ((mealRes.data as { meal_date: string; image_path: string | null }[] | null) ?? [])
      .filter((r) => r.image_path)
      .map((r) => r.meal_date),
  );

  const days: WeeklyReviewDay[] = [];
  let cursor = start;
  while (cursor <= end) {
    const snapshot = snapshots.get(cursor);
    days.push({
      date: cursor,
      totalTargetSets: snapshot?.totalTargetSets ?? 0,
      doneSets: doneByDate.get(cursor) ?? 0,
      difficulty: snapshot?.difficulty ?? null,
      hasMeal: mealDates.has(cursor),
    });
    cursor = addDays(cursor, 1);
  }

  return days;
}
