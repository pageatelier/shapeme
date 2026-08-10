import Link from "next/link";
import { DailyMemo } from "@/components/DailyMemo";
import { HomeMealGrid } from "@/components/HomeMealGrid";
import { HomeWaterCard } from "@/components/HomeWaterCard";
import { CheckIcon, ChevronRightIcon, HourglassIcon } from "@/components/icons";
import { WaterGoalEditor } from "@/components/WaterGoalEditor";
import { getRoutineDayDetailsSafe } from "@/lib/aiRoutine/queries";
import { isoDateInTimeZone, weekdayIndex } from "@/lib/body/date";
import { todayCopy } from "@/lib/copy/today";
import { movePercentFor } from "@/lib/dailyCompletion";
import { getDailyMessage, getGreetingPrefix } from "@/lib/greeting";
import { getJourneyProgress } from "@/lib/journey";
import { getMealLogsSafe } from "@/lib/meal/queries";
import { MEAL_TYPES } from "@/lib/meal/types";
import { getMovementLogsByDateSafe } from "@/lib/movement/queries";
import { getDailyNoteSafe } from "@/lib/notes/queries";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";
import { getWaterLogsSafe } from "@/lib/water/queries";
import { getRoutinesSafe } from "@/lib/workout/queries";
import { WEEKDAYS } from "@/lib/workout/types";

// Shared "less card-y" treatment for Today's stat surfaces — smaller radius,
// near-flat shadow, thin border — vs. the app-wide .glass-card/.surface-card
// classes other (not-yet-redesigned) pages still use.
const compactCardStyle = {
  background: "var(--surface-card)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--shadow-xs)",
};

export default async function TodayPage() {
  const user = await getCurrentUser();

  const metadata = user?.user_metadata as { display_name?: string; timezone?: string } | undefined;
  const displayName = metadata?.display_name || "there";
  const timezone = metadata?.timezone || "Asia/Seoul";
  const settings = readSettings(user?.user_metadata);

  // One shared "today" for this page, resolved in the user's own timezone.
  const todayIso = isoDateInTimeZone(new Date(), timezone);
  const todayWeekday = WEEKDAYS[weekdayIndex(todayIso)];
  const currentHour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date()),
  );
  const greetingPrefix = getGreetingPrefix(currentHour);
  const dailyMessage = getDailyMessage(todayIso);

  const journey = getJourneyProgress({
    startedAt: settings.programStartedAt ?? user?.created_at ?? todayIso,
    goalPeriod: settings.goalPeriod,
  });

  // Independent reads — fetched together instead of one-after-another so
  // this page doesn't wait on sequential round trips just to render.
  const [routines, movementLogs, water, meals, dailyNote] = user
    ? await Promise.all([
        getRoutinesSafe(user.id, todayIso),
        getMovementLogsByDateSafe(user.id, todayIso),
        getWaterLogsSafe(user.id, todayIso),
        getMealLogsSafe(user.id, todayIso),
        getDailyNoteSafe(user.id, todayIso),
      ])
    : [
        [],
        [],
        { entries: [], totalMl: 0 },
        MEAL_TYPES.map((type) => ({ type, date: todayIso, filled: false })),
        { memo: null, isPublic: false },
      ];

  // All routines scheduled for today — not just the first match, since
  // routines can share a day (e.g. 월,목 힙 + 월,화 어깨 both apply on 월).
  const todayRoutines = routines.filter((r) => r.days.includes(todayWeekday));
  const todayExercises = todayRoutines.flatMap((r) => r.exercises);
  const workoutDoneSets = todayExercises.reduce((sum, e) => sum + e.sets.filter(Boolean).length, 0);
  const workoutTotalSets = todayExercises.reduce((sum, e) => sum + e.targetSets, 0);

  const hasMoveToday = workoutDoneSets > 0 || movementLogs.length > 0;
  // Whether Move counts as part of today at all — a routine is scheduled,
  // or the user already logged movement voluntarily even without one.
  // False means a genuine rest day, shown as "Rest" rather than "0%".
  const moveAppliesToday = workoutTotalSets > 0 || hasMoveToday;

  // Depends on todayRoutines' ids, so this can't join the Promise.all above —
  // only fetched when there's something to look up for. Not rendered as its
  // own card (see TodayAiRoutineCard's removal) — folded into Today's Focus.
  const routineDayDetails = user
    ? await getRoutineDayDetailsSafe(
        user.id,
        todayRoutines.map((r) => r.id),
      )
    : new Map();
  const todayAiRoutine = todayRoutines
    .map((r) => ({ routine: r, detail: routineDayDetails.get(r.id) }))
    .find((x) => x.detail);

  const movePercent = movePercentFor({
    workoutDoneSets,
    workoutTotalSets,
    hasMovementLog: movementLogs.length > 0,
  });
  const mealDoneToday = meals.some((m) => m.filled);
  const cupsCurrent = Math.round(water.totalMl / settings.cupMl);
  const cupsGoal = Math.round(settings.waterGoalMl / settings.cupMl);

  // "Today's Focus" hero — the scheduled routine's own name always leads
  // (that's what the user actually called it in Move), with the AI day
  // detail's estimated minutes folded into the subtitle when one exists,
  // rather than the AI's generic day-title silently replacing the name.
  const focusDetail = todayAiRoutine?.detail;
  const focusTitle =
    todayRoutines.length > 0 ? todayRoutines.map((r) => r.name).join(", ") : todayCopy.focus.restTitle;
  const focusSubtitle =
    todayRoutines.length > 0
      ? focusDetail?.estimatedMinutes != null
        ? todayCopy.focus.minutes(focusDetail.estimatedMinutes)
        : todayCopy.focus.exerciseCount(todayExercises.length)
      : todayCopy.focus.restSubtitle;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[15px] leading-[1.5] tracking-[-0.02em] text-text-secondary">
          {greetingPrefix}, <span className="font-semibold text-text-primary">{displayName}</span>
        </p>
        <h1 className="font-cormorant mt-2 text-[clamp(28px,7vw,36px)] leading-[1.15] font-semibold tracking-[-0.02em] text-text-primary">
          {dailyMessage}
        </h1>
        <p className="font-en mt-3 text-[11px] font-semibold tracking-[0.14em] text-text-muted">
          {todayCopy.journey.dayLabel} {journey.currentDay} / {journey.totalDays}
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] p-4" style={compactCardStyle}>
        <p className="font-en mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-text-muted">
          {todayCopy.journey.label}
        </p>
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="font-en flex items-baseline gap-1.5 text-[11px] font-semibold tracking-[0.1em] text-text-muted">
            {todayCopy.journey.weekLabel}
            <span className="font-cormorant text-lg font-semibold tracking-normal text-text-primary">
              {String(journey.currentWeek).padStart(2, "0")}
            </span>
            / {journey.totalWeeks}
          </span>
          <span className="font-en text-2xl font-semibold tracking-[-0.05em] text-text-primary">
            {journey.percent}%
          </span>
        </div>
        <div className="relative h-px" style={{ background: "var(--progress-track)" }}>
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${journey.percent}%`, background: "var(--color-ink)" }}
          />
          <span
            className="absolute top-1/2"
            style={{ left: `${journey.percent}%`, transform: "translate(-50%, -50%)" }}
          >
            <HourglassIcon className="h-3 w-3 text-text-primary" />
          </span>
        </div>
        <p className="font-en mt-2 text-right text-[9px] font-semibold tracking-[0.1em] text-text-muted">
          {todayCopy.journey.complete}
        </p>
      </div>

      <Link
        href="/move"
        className="flex items-center justify-between rounded-[var(--radius-lg)] p-4"
        style={compactCardStyle}
      >
        <div>
          <p className="font-en mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-text-muted">
            {todayCopy.focus.label}
          </p>
          <p className="font-cormorant text-xl leading-[1.2] font-semibold tracking-[-0.01em] text-text-primary">
            {focusTitle}
          </p>
          <p className="mt-1 text-[12px] text-text-secondary">{focusSubtitle}</p>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--color-ink)" }}
        >
          <ChevronRightIcon className="h-4 w-4 text-text-inverse" />
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-lg)] p-4" style={compactCardStyle}>
        <div className="flex flex-col items-center gap-1">
          <span className="font-en text-[9px] font-semibold tracking-[0.1em] text-text-muted">
            {todayCopy.stats.move}
          </span>
          <span className="font-en text-base font-semibold text-text-primary">
            {moveAppliesToday ? `${Math.round(movePercent)}%` : todayCopy.stats.moveRest}
          </span>
        </div>
        {settings.mealTrackingEnabled && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-en text-[9px] font-semibold tracking-[0.1em] text-text-muted">
              {todayCopy.stats.nourish}
            </span>
            <span className="flex h-[18px] items-center justify-center text-text-primary">
              {mealDoneToday ? <CheckIcon className="h-3.5 w-3.5" /> : "–"}
            </span>
          </div>
        )}
        {settings.waterTrackingEnabled && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-en text-[9px] font-semibold tracking-[0.1em] text-text-muted">
              {todayCopy.stats.water}
            </span>
            <span className="font-en text-base font-semibold text-text-primary">
              {cupsCurrent} / {cupsGoal}
            </span>
          </div>
        )}
      </div>

      {settings.mealTrackingEnabled && (
        <section>
          <div className="mb-3 flex items-center justify-between text-[15px] font-bold tracking-[-0.02em] text-text-primary">
            {todayCopy.nourish.title}
            <Link href="/meal" className="font-en text-[11px] font-semibold tracking-[0.03em] text-text-muted lowercase">
              {todayCopy.nourish.seeAll}
            </Link>
          </div>
          <HomeMealGrid meals={meals} />
        </section>
      )}

      {settings.waterTrackingEnabled && (
        <section>
          <WaterGoalEditor waterGoalMl={settings.waterGoalMl} cupMl={settings.cupMl} />
          <HomeWaterCard
            date={todayIso}
            entries={water.entries}
            totalMl={water.totalMl}
            goalMl={settings.waterGoalMl}
            cupMl={settings.cupMl}
          />
        </section>
      )}

      <section>
        <p className="mb-3 text-[15px] font-bold tracking-[-0.02em] text-text-primary">{todayCopy.moment.title}</p>
        <DailyMemo date={todayIso} note={dailyNote} />
      </section>
    </div>
  );
}
