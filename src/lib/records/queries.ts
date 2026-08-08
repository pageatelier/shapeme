import { weekdayIndex } from "@/lib/body/date";
import { movePercentFor, routineCompletionPercent } from "@/lib/dailyCompletion";
import { createClient } from "@/lib/supabase/server";
import { getDailyMoveSnapshotsInRangeSafe } from "@/lib/workout/queries";
import { WEEKDAYS } from "@/lib/workout/types";
import type { RecordCalendarDay } from "./types";

type RoutineRow = { id: string; days: string[] };
type ExerciseRow = { id: string; routine_id: string; target_sets: number };
type SetLogRow = { exercise_id: string; log_date: string; sets: boolean[] };
type MovementRow = { log_date: string };
type MealRow = { meal_date: string; image_path: string | null };
type WaterRow = { amount_ml: number; logged_at: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * One month's "오늘의 루틴" % per day, for My's compact calendar's coloring —
 * same formula as Today's own card (movePercentFor + routineCompletionPercent),
 * just computed for a whole month at once instead of just today. Each past
 * day's target-set total is read from daily_move_snapshots (frozen the day
 * it happened) so later routine/exercise edits never retroactively repaint
 * old days; only dates from before that table existed fall back to today's
 * live schedule, same as before.
 */
export async function getMyRecordsMonth(
  userId: string,
  year: number,
  month: number,
  settings: { mealTrackingEnabled: boolean; waterTrackingEnabled: boolean; waterGoalMl: number },
): Promise<RecordCalendarDay[]> {
  const supabase = await createClient();
  const daysInMonth = new Date(year, month, 0).getDate();
  const start = `${year}-${pad(month)}-01`;
  const end = `${year}-${pad(month)}-${pad(daysInMonth)}`;
  const todayIso = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

  const [routinesRes, exercisesRes, setLogsRes, movementRes, mealRes, waterRes, moveSnapshots] = await Promise.all([
    supabase.from("workout_routines").select("id, days").eq("user_id", userId),
    supabase.from("workout_exercises").select("id, routine_id, target_sets").eq("user_id", userId),
    supabase
      .from("workout_set_logs")
      .select("exercise_id, log_date, sets")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", end),
    supabase.from("movement_logs").select("log_date").eq("user_id", userId).gte("log_date", start).lte("log_date", end),
    supabase
      .from("meal_logs")
      .select("meal_date, image_path")
      .eq("user_id", userId)
      .gte("meal_date", start)
      .lte("meal_date", end),
    supabase
      .from("water_logs")
      .select("amount_ml, logged_at")
      .eq("user_id", userId)
      // Explicit +09:00 (KST) offset — see src/lib/water/queries.ts for why.
      .gte("logged_at", `${start}T00:00:00+09:00`)
      .lte("logged_at", `${end}T23:59:59.999+09:00`),
    getDailyMoveSnapshotsInRangeSafe(userId, start, end),
  ]);
  if (routinesRes.error) throw routinesRes.error;
  if (exercisesRes.error) throw exercisesRes.error;
  if (setLogsRes.error) throw setLogsRes.error;
  if (movementRes.error) throw movementRes.error;
  if (mealRes.error) throw mealRes.error;
  if (waterRes.error) throw waterRes.error;

  const routines = (routinesRes.data ?? []) as RoutineRow[];
  const exercises = (exercisesRes.data ?? []) as ExerciseRow[];

  // Fallback total for dates with no daily_move_snapshots row yet (written
  // before that migration shipped) — for each weekday, target sets summed
  // across every routine *currently* scheduled for it. Routines can share a
  // day (e.g. 월,목 힙 + 월,화 어깨 both apply on 월), so this sums across all
  // matches, not just the first (mirrors Today's own `routines.filter(...)`).
  const weekdayTotalTargetSets = new Map<string, number>();
  for (const weekday of WEEKDAYS) {
    const dayRoutineIds = new Set(routines.filter((r) => r.days.includes(weekday)).map((r) => r.id));
    if (dayRoutineIds.size === 0) continue;
    const total = exercises
      .filter((e) => dayRoutineIds.has(e.routine_id))
      .reduce((sum, e) => sum + e.target_sets, 0);
    weekdayTotalTargetSets.set(weekday, total);
  }

  // "Done" is just what actually got logged that date — a real historical
  // fact independent of whatever the routine schedule looks like today, so
  // (unlike the total above) it needs no fallback or weekday filtering.
  const doneSetsByDate = new Map<string, number>();
  for (const row of (setLogsRes.data ?? []) as SetLogRow[]) {
    const done = row.sets.filter(Boolean).length;
    doneSetsByDate.set(row.log_date, (doneSetsByDate.get(row.log_date) ?? 0) + done);
  }

  const movementDates = new Set(((movementRes.data ?? []) as MovementRow[]).map((r) => r.log_date));
  const mealDates = new Set(
    ((mealRes.data ?? []) as MealRow[]).filter((r) => r.image_path).map((r) => r.meal_date),
  );

  const waterByDate = new Map<string, number>();
  for (const row of (waterRes.data ?? []) as WaterRow[]) {
    const date = row.logged_at.slice(0, 10);
    waterByDate.set(date, (waterByDate.get(date) ?? 0) + row.amount_ml);
  }

  const days: RecordCalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const isoDate = `${year}-${pad(month)}-${pad(d)}`;
    const isToday = isoDate === todayIso;

    if (isoDate > todayIso) {
      days.push({ date: d, isoDate, isToday, routinePercent: null });
      continue;
    }

    const weekday = WEEKDAYS[weekdayIndex(isoDate)];
    const workoutDoneSets = doneSetsByDate.get(isoDate) ?? 0;
    const workoutTotalSets = moveSnapshots.get(isoDate)?.totalTargetSets ?? weekdayTotalTargetSets.get(weekday) ?? 0;
    const movePercent = movePercentFor({
      workoutDoneSets,
      workoutTotalSets,
      hasMovementLog: movementDates.has(isoDate),
    });
    const mealDoneToday = mealDates.has(isoDate);
    const waterPct = Math.min(100, Math.round(((waterByDate.get(isoDate) ?? 0) / settings.waterGoalMl) * 100));

    const routinePercent = routineCompletionPercent({
      movePercent,
      mealDoneToday,
      waterPct,
      mealTrackingEnabled: settings.mealTrackingEnabled,
      waterTrackingEnabled: settings.waterTrackingEnabled,
    });

    days.push({ date: d, isoDate, isToday, routinePercent });
  }

  return days;
}

export async function getMyRecordsMonthSafe(
  userId: string,
  year: number,
  month: number,
  settings: { mealTrackingEnabled: boolean; waterTrackingEnabled: boolean; waterGoalMl: number },
): Promise<RecordCalendarDay[]> {
  try {
    return await getMyRecordsMonth(userId, year, month, settings);
  } catch (error) {
    console.error("[records] getMyRecordsMonth failed, falling back to empty:", error);
    const daysInMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const isoDate = `${year}-${pad(month)}-${pad(d)}`;
      return { date: d, isoDate, isToday: isoDate === todayIso, routinePercent: isoDate > todayIso ? null : 0 };
    });
  }
}
