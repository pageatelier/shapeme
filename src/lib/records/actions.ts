"use server";

import { isoDateInTimeZone, weekdayIndex } from "@/lib/body/date";
import { getBodyEntryByDateSafe } from "@/lib/body/queries";
import { movePercentFor, routineCompletionPercent } from "@/lib/dailyCompletion";
import { getJournalEntryByDateSafe } from "@/lib/journal/queries";
import { getMealLogsSafe } from "@/lib/meal/queries";
import { getMovementLogsByDateSafe } from "@/lib/movement/queries";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";
import { getWaterLogsSafe } from "@/lib/water/queries";
import { getRoutinesSafe } from "@/lib/workout/queries";
import { WEEKDAYS } from "@/lib/workout/types";
import { getMyRecordsMonthSafe } from "./queries";
import type { RecordCalendarDay, RecordDetail } from "./types";

/** My's calendar month-nav — re-fetches the requested month's per-day
 * "오늘의 루틴" colors, client-invoked so navigating months doesn't reload
 * the whole My page. */
export async function getMyRecordsMonthAction(year: number, month: number): Promise<RecordCalendarDay[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const settings = readSettings(user.user_metadata);
  return getMyRecordsMonthSafe(user.id, year, month, settings);
}

const EMPTY_DETAIL = (isoDate: string, isFuture: boolean): RecordDetail => ({
  isoDate,
  isFuture,
  hasAnyRecord: false,
  routinePercent: 0,
  body: null,
  move: null,
  meals: [],
  water: null,
  journal: null,
});

/** My's calendar date-select — fetches one day's full record detail,
 * client-invoked so tapping a date updates the page in place instead of
 * navigating. Future dates aren't selectable from the calendar UI, but this
 * guards the same way in case it's ever called directly. */
export async function getMyRecordDetailAction(isoDate: string): Promise<RecordDetail | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const metadata = user.user_metadata as { timezone?: string; weight_kg?: number } | undefined;
  const timezone = metadata?.timezone || "Asia/Seoul";
  const todayIso = isoDateInTimeZone(new Date(), timezone);
  if (isoDate > todayIso) return EMPTY_DETAIL(isoDate, true);

  const settings = readSettings(user.user_metadata);

  const [bodyEntry, routines, movementLogs, meals, water, journal] = await Promise.all([
    getBodyEntryByDateSafe(user.id, isoDate),
    getRoutinesSafe(user.id, isoDate),
    getMovementLogsByDateSafe(user.id, isoDate),
    getMealLogsSafe(user.id, isoDate),
    getWaterLogsSafe(user.id, isoDate),
    getJournalEntryByDateSafe(user.id, isoDate),
  ]);

  // All routines scheduled for this weekday, not just the first — routines
  // can share a day (e.g. 월,목 힙 + 월,화 어깨 both apply on 월).
  const weekday = WEEKDAYS[weekdayIndex(isoDate)];
  const dayRoutines = routines.filter((r) => r.days.includes(weekday));
  const dayExercises = dayRoutines.flatMap((r) => r.exercises);
  const workoutDoneSets = dayExercises.reduce((sum, e) => sum + e.sets.filter(Boolean).length, 0);
  const workoutTotalSets = dayExercises.reduce((sum, e) => sum + e.targetSets, 0);

  const movePercent = movePercentFor({
    workoutDoneSets,
    workoutTotalSets,
    hasMovementLog: movementLogs.length > 0,
  });
  const filledMeals = meals.filter((m) => m.filled);
  const mealDoneToday = filledMeals.length > 0;
  const waterPct = Math.min(100, Math.round((water.totalMl / settings.waterGoalMl) * 100));

  const routinePercent = routineCompletionPercent({
    movePercent,
    mealDoneToday,
    waterPct,
    mealTrackingEnabled: settings.mealTrackingEnabled,
    waterTrackingEnabled: settings.waterTrackingEnabled,
  });

  const hasBodyPhoto = !!(bodyEntry?.front || bodyEntry?.side || bodyEntry?.back);
  const hasMove = workoutTotalSets > 0 || movementLogs.length > 0;
  const hasWater = water.entries.length > 0;
  const hasJournal = !!(journal?.mood || journal?.dayText || journal?.goodThing);
  const hasAnyRecord = hasBodyPhoto || hasMove || mealDoneToday || hasWater || hasJournal;

  return {
    isoDate,
    isFuture: false,
    hasAnyRecord,
    routinePercent,
    body: hasBodyPhoto
      ? {
          frontImageUrl: bodyEntry?.frontImageUrl,
          sideImageUrl: bodyEntry?.sideImageUrl,
          backImageUrl: bodyEntry?.backImageUrl,
          weightKg: isoDate === todayIso ? (metadata?.weight_kg ?? null) : null,
        }
      : null,
    move: hasMove
      ? {
          // Joined — a day can have more than one scheduled routine.
          routineName: workoutTotalSets > 0 ? dayRoutines.map((r) => r.name).join(", ") || null : null,
          doneSets: workoutDoneSets,
          totalSets: workoutTotalSets,
          movementLogs,
        }
      : null,
    meals: settings.mealTrackingEnabled ? filledMeals : [],
    water:
      settings.waterTrackingEnabled && hasWater
        ? { entries: water.entries, totalMl: water.totalMl, goalMl: settings.waterGoalMl, pct: waterPct }
        : null,
    journal: hasJournal ? { mood: journal!.mood, dayText: journal!.dayText, goodThing: journal!.goodThing } : null,
  };
}
