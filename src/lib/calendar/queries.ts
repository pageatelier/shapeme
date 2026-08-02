import { todayIsoDate } from "@/lib/body/date";
import { getBodyEntries } from "@/lib/body/queries";
import { challengeDayNumber } from "@/lib/challenge/date";
import { getChallengeDayLogs } from "@/lib/challenge/queries";
import type { Challenge } from "@/lib/challenge/types";
import { getDailyNotesForRange } from "@/lib/notes/queries";
import { createClient } from "@/lib/supabase/server";
import type { CalendarDay, MonthlyReport } from "./types";

type SetLogRow = {
  log_date: string;
  sets: boolean[];
  workout_exercises: { target_sets: number } | { target_sets: number }[] | null;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export async function getCalendarMonth(
  userId: string,
  challenge: Challenge | null,
  year: number,
  month: number,
): Promise<{ days: CalendarDay[]; report: MonthlyReport }> {
  const supabase = await createClient();
  const daysInMonth = new Date(year, month, 0).getDate();
  const start = `${year}-${pad(month)}-01`;
  const end = `${year}-${pad(month)}-${pad(daysInMonth)}`;
  const todayIso = todayIsoDate();

  const [bodyEntries, setLogsRes, notesByDate, challengeLogs] = await Promise.all([
    getBodyEntries(userId),
    supabase
      .from("workout_set_logs")
      .select("log_date, sets, workout_exercises(target_sets)")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", end),
    getDailyNotesForRange(userId, start, end),
    challenge ? getChallengeDayLogs(userId, challenge.id, start, end) : Promise.resolve([]),
  ]);

  if (setLogsRes.error) throw setLogsRes.error;

  const bodyByDate = new Map(bodyEntries.map((entry) => [entry.date, entry]));
  const challengeLogByDate = new Map(challengeLogs.map((log) => [log.logDate, log]));
  const partialByDate = new Map<string, { completed: number; total: number }>();

  for (const row of (setLogsRes.data ?? []) as SetLogRow[]) {
    const relation = Array.isArray(row.workout_exercises) ? row.workout_exercises[0] : row.workout_exercises;
    const target = relation?.target_sets ?? row.sets.length;
    const bucket = partialByDate.get(row.log_date) ?? { completed: 0, total: 0 };
    bucket.completed += row.sets.filter(Boolean).length;
    bucket.total += target;
    partialByDate.set(row.log_date, bucket);
  }

  const days: CalendarDay[] = [];
  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
    const isoDate = `${year}-${pad(month)}-${pad(dayOfMonth)}`;
    const isFuture = isoDate > todayIso;
    const log = challengeLogByDate.get(isoDate);
    const partial = partialByDate.get(isoDate);
    const dayNumber = challenge ? challengeDayNumber(challenge.startDate, isoDate) : null;
    const withinChallenge = dayNumber !== null && dayNumber >= 1 && dayNumber <= 100;

    let status: CalendarDay["status"] = isFuture ? "future" : "empty";
    if (!isFuture && log?.status === "workout") status = "workout";
    else if (!isFuture && log?.status === "recovery") status = "recovery";
    else if (!isFuture && partial && partial.completed > 0) status = "partial";

    days.push({
      date: dayOfMonth,
      isoDate,
      isToday: isoDate === todayIso,
      challengeDay: withinChallenge ? dayNumber : null,
      status,
      completedSets: log?.completedSets ?? partial?.completed ?? 0,
      totalSets: log?.totalSets ?? partial?.total ?? 0,
      routineName: log?.routineName,
      recoveryReason: log?.recoveryReason,
      body: bodyByDate.get(isoDate),
      memo: notesByDate.get(isoDate),
    });
  }

  const report: MonthlyReport = {
    workoutDays: days.filter((day) => day.status === "workout").length,
    recoveryDays: days.filter((day) => day.status === "recovery").length,
    bodyPhotoDays: days.filter((day) => day.body).length,
    completedSets: days.reduce((sum, day) => sum + day.completedSets, 0),
  };

  return { days, report };
}

export async function getCalendarMonthSafe(userId: string, challenge: Challenge | null, year: number, month: number) {
  try {
    return await getCalendarMonth(userId, challenge, year, month);
  } catch (error) {
    console.error("[calendar] getCalendarMonth failed:", error);
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayIso = todayIsoDate();
    const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, index) => {
      const dayOfMonth = index + 1;
      const isoDate = `${year}-${pad(month)}-${pad(dayOfMonth)}`;
      return {
        date: dayOfMonth,
        isoDate,
        isToday: isoDate === todayIso,
        challengeDay: challenge ? challengeDayNumber(challenge.startDate, isoDate) : null,
        status: isoDate > todayIso ? "future" : "empty",
        completedSets: 0,
        totalSets: 0,
      };
    });
    return { days, report: { workoutDays: 0, recoveryDays: 0, bodyPhotoDays: 0, completedSets: 0 } satisfies MonthlyReport };
  }
}
