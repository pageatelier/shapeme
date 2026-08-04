import { weekdayIndex } from "@/lib/body/date";
import { movePercentFor, routineCompletionPercent } from "@/lib/dailyCompletion";
import { createClient } from "@/lib/supabase/server";
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
 * just computed for a whole month at once instead of just today. Matches
 * each day to whichever routine is *currently* scheduled for that weekday
 * (routines aren't versioned by date), the same assumption Today's card
 * already makes for "today" — applying it to past days here is consistent
 * with that, not a new limitation.
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

  const [routinesRes, exercisesRes, setLogsRes, movementRes, mealRes, waterRes] = await Promise.all([
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
  ]);
  if (routinesRes.error) throw routinesRes.error;
  if (exercisesRes.error) throw exercisesRes.error;
  if (setLogsRes.error) throw setLogsRes.error;
  if (movementRes.error) throw movementRes.error;
  if (mealRes.error) throw mealRes.error;
  if (waterRes.error) throw waterRes.error;

  const routines = (routinesRes.data ?? []) as RoutineRow[];
  const exercises = (exercisesRes.data ?? []) as ExerciseRow[];

  // For each weekday, the exercises belonging to whichever routine is
  // currently scheduled for it (mirrors Today's `routines.find(...)`).
  const weekdaySchedule = new Map<string, { exerciseIds: Set<string>; totalTargetSets: number }>();
  for (const weekday of WEEKDAYS) {
    const routine = routines.find((r) => r.days.includes(weekday));
    if (!routine) continue;
    const routineExercises = exercises.filter((e) => e.routine_id === routine.id);
    weekdaySchedule.set(weekday, {
      exerciseIds: new Set(routineExercises.map((e) => e.id)),
      totalTargetSets: routineExercises.reduce((sum, e) => sum + e.target_sets, 0),
    });
  }

  const doneSetsByDate = new Map<string, number>();
  for (const row of (setLogsRes.data ?? []) as SetLogRow[]) {
    const weekday = WEEKDAYS[weekdayIndex(row.log_date)];
    const scheduled = weekdaySchedule.get(weekday);
    if (!scheduled || !scheduled.exerciseIds.has(row.exercise_id)) continue;
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
    const scheduled = weekdaySchedule.get(weekday);
    const workoutDoneSets = doneSetsByDate.get(isoDate) ?? 0;
    const workoutTotalSets = scheduled?.totalTargetSets ?? 0;
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
