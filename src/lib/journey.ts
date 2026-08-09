/**
 * "WEEK N / TOTAL · X% COMPLETE" journey card on Today — how far into the
 * user's current goalPeriod program they are. Shared math so the number
 * can't drift between wherever it's shown.
 */
export function getJourneyProgress({
  startedAt,
  goalPeriod,
  now = new Date(),
}: {
  /** ISO timestamp the program started — settings.programStartedAt when
   * present, otherwise the Supabase Auth user's own created_at (set once,
   * automatically, for every account — a ready-made fallback for anyone
   * who finished onboarding before this field existed). */
  startedAt: string;
  /** Settings.goalPeriod, e.g. "12주" — only the leading integer matters. */
  goalPeriod: string;
  now?: Date;
}): { currentWeek: number; totalWeeks: number; currentDay: number; totalDays: number; percent: number } {
  const parsed = parseInt(goalPeriod, 10);
  const totalWeeks = Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
  const totalDays = totalWeeks * 7;

  const start = new Date(startedAt);
  const daysElapsed = Math.max(0, (now.getTime() - start.getTime()) / 86_400_000);

  const currentWeek = Math.min(totalWeeks, Math.floor(daysElapsed / 7) + 1);
  const currentDay = Math.min(totalDays, Math.floor(daysElapsed) + 1);
  const percent = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  return { currentWeek, totalWeeks, currentDay, totalDays, percent };
}
