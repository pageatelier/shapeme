import { todayIsoDate, weekdayIndex } from "@/lib/body/date";
import { getBodyEntriesInRange } from "@/lib/body/queries";
import { dayCompletionPercent } from "@/lib/dailyCompletion";
import { water } from "@/lib/mock-data";
import { getDailyNotesForRange } from "@/lib/notes/queries";
import { createClient } from "@/lib/supabase/server";
import { WEEKDAYS } from "@/lib/workout/types";
import type { CalendarDay, MonthlyReport } from "./types";

type SetLogRow = {
  log_date: string;
  sets: boolean[];
  workout_exercises: { target_sets: number } | { target_sets: number }[] | null;
};

type WaterLogRow = { amount_ml: number; logged_at: string };
type MealLogRow = { meal_date: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Real per-day status for one calendar month, aggregated across
 * body_entries / workout_set_logs / water_logs / meal_logs. `completionRate`
 * is a simple average of the four category percentages — a v1 formula, not
 * a tuned scoring model.
 */
export async function getCalendarMonth(
  userId: string,
  year: number,
  month: number,
): Promise<{ days: CalendarDay[]; report: MonthlyReport }> {
  const supabase = await createClient();
  const daysInMonth = new Date(year, month, 0).getDate();
  const start = `${year}-${pad(month)}-01`;
  const end = `${year}-${pad(month)}-${pad(daysInMonth)}`;
  const todayIso = todayIsoDate();

  const [bodyEntries, setLogsRes, waterLogsRes, mealLogsRes, notesByDate] = await Promise.all([
    getBodyEntriesInRange(userId, start, end),
    supabase
      .from("workout_set_logs")
      .select("log_date, sets, workout_exercises(target_sets)")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", end),
    supabase
      .from("water_logs")
      .select("amount_ml, logged_at")
      .eq("user_id", userId)
      // Explicit +09:00 (KST) offset — see the matching comment in
      // src/lib/water/queries.ts for why the offset is required here.
      .gte("logged_at", `${start}T00:00:00+09:00`)
      .lte("logged_at", `${end}T23:59:59.999+09:00`),
    supabase
      .from("meal_logs")
      .select("meal_date")
      .eq("user_id", userId)
      .gte("meal_date", start)
      .lte("meal_date", end),
    getDailyNotesForRange(userId, start, end),
  ]);

  if (setLogsRes.error) throw setLogsRes.error;
  if (waterLogsRes.error) throw waterLogsRes.error;
  if (mealLogsRes.error) throw mealLogsRes.error;

  const bodyByDate = new Map(bodyEntries.map((e) => [e.date, e]));

  const workoutByDate = new Map<string, { done: number; target: number }>();
  for (const row of (setLogsRes.data ?? []) as SetLogRow[]) {
    const target = Array.isArray(row.workout_exercises)
      ? (row.workout_exercises[0]?.target_sets ?? row.sets.length)
      : (row.workout_exercises?.target_sets ?? row.sets.length);
    const done = row.sets.filter(Boolean).length;
    const bucket = workoutByDate.get(row.log_date) ?? { done: 0, target: 0 };
    bucket.done += done;
    bucket.target += target;
    workoutByDate.set(row.log_date, bucket);
  }

  const waterByDate = new Map<string, number>();
  for (const row of (waterLogsRes.data ?? []) as WaterLogRow[]) {
    const date = row.logged_at.slice(0, 10);
    waterByDate.set(date, (waterByDate.get(date) ?? 0) + row.amount_ml);
  }

  const mealCountByDate = new Map<string, number>();
  for (const row of (mealLogsRes.data ?? []) as MealLogRow[]) {
    mealCountByDate.set(row.meal_date, (mealCountByDate.get(row.meal_date) ?? 0) + 1);
  }

  const days: CalendarDay[] = [];
  const rateByWeekday = new Map<string, number[]>();

  for (let d = 1; d <= daysInMonth; d++) {
    const isoDate = `${year}-${pad(month)}-${pad(d)}`;
    const isFuture = isoDate > todayIso;

    const workout = workoutByDate.get(isoDate);
    const workoutPct = workout && workout.target > 0 ? (workout.done / workout.target) * 100 : 0;
    const workoutDone = workoutPct > 0;

    const waterMl = waterByDate.get(isoDate) ?? 0;
    const waterPct = Math.min(100, (waterMl / water.goalMl) * 100);
    const waterDone = waterMl >= water.goalMl;

    const mealCount = mealCountByDate.get(isoDate) ?? 0;
    const mealPct = Math.min(100, (mealCount / 4) * 100);
    const mealDone = mealCount > 0;

    const body = bodyByDate.get(isoDate);
    const bodyPct = body && (body.front || body.side || body.back) ? 100 : 0;

    const completionRate = isFuture
      ? null
      : dayCompletionPercent({ workoutPct, waterPct, mealPct, bodyPct });

    if (!isFuture) {
      const weekday = WEEKDAYS[weekdayIndex(isoDate)];
      const bucket = rateByWeekday.get(weekday) ?? [];
      bucket.push(completionRate ?? 0);
      rateByWeekday.set(weekday, bucket);
    }

    days.push({
      date: d,
      isoDate,
      isToday: isoDate === todayIso,
      completionRate,
      workoutDone,
      waterDone,
      mealDone,
      body,
      memo: notesByDate.get(isoDate),
    });
  }

  const pastDays = days.filter((d) => d.completionRate !== null);
  const avgCompletion =
    pastDays.length === 0
      ? 0
      : Math.round(pastDays.reduce((sum, d) => sum + (d.completionRate ?? 0), 0) / pastDays.length);

  let bestStreakDay: string | null = null;
  let bestAvg = -1;
  for (const [weekday, rates] of rateByWeekday) {
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestStreakDay = weekday;
    }
  }

  const report: MonthlyReport = {
    avgCompletion,
    workoutDays: pastDays.filter((d) => d.workoutDone).length,
    waterGoalDays: pastDays.filter((d) => d.waterDone).length,
    mealLogDays: pastDays.filter((d) => d.mealDone).length,
    bodyPhotoDays: pastDays.filter((d) => d.body).length,
    bestStreakDay: bestStreakDay ? `${bestStreakDay}요일` : null,
  };

  return { days, report };
}

export async function getCalendarMonthSafe(userId: string, year: number, month: number) {
  try {
    return await getCalendarMonth(userId, year, month);
  } catch (error) {
    console.error("[calendar] getCalendarMonth failed, falling back to empty:", error);
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayIso = todayIsoDate();
    const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const isoDate = `${year}-${pad(month)}-${pad(d)}`;
      return {
        date: d,
        isoDate,
        isToday: isoDate === todayIso,
        completionRate: isoDate > todayIso ? null : 0,
        workoutDone: false,
        waterDone: false,
        mealDone: false,
      };
    });
    return {
      days,
      report: {
        avgCompletion: 0,
        workoutDays: 0,
        waterGoalDays: 0,
        mealLogDays: 0,
        bodyPhotoDays: 0,
        bestStreakDay: null,
      } satisfies MonthlyReport,
    };
  }
}
