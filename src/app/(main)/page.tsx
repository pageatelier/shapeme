import Link from "next/link";
import { DailyMemo } from "@/components/DailyMemo";
import { HomeMealGrid } from "@/components/HomeMealGrid";
import { HomeWaterCard } from "@/components/HomeWaterCard";
import { ChevronRightIcon, HeartIcon } from "@/components/icons";
import { TodayAiRoutineCard } from "@/components/TodayAiRoutineCard";
import { WaterGoalEditor } from "@/components/WaterGoalEditor";
import { getRoutineDayDetailsSafe, hasAnyAiRoutineSafe } from "@/lib/aiRoutine/queries";
import { isoDateInTimeZone, weekdayIndex } from "@/lib/body/date";
import { todayCopy } from "@/lib/copy/today";
import { movePercentFor } from "@/lib/dailyCompletion";
import { getDailyMessage, getGreetingPrefix } from "@/lib/greeting";
import { getJourneyProgress } from "@/lib/journey";
import { getMealLogsSafe } from "@/lib/meal/queries";
import { MEAL_TYPES } from "@/lib/meal/types";
import { today as mockToday } from "@/lib/mock-data";
import { getMovementLogsByDateSafe } from "@/lib/movement/queries";
import { ACTIVITY_CONFIG } from "@/lib/movement/types";
import { getDailyNoteSafe } from "@/lib/notes/queries";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";
import { getWaterLogsSafe } from "@/lib/water/queries";
import { getRoutinesSafe } from "@/lib/workout/queries";
import { WEEKDAYS } from "@/lib/workout/types";

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
  // only fetched when there's something to look up for.
  const [routineDayDetails, hasAnyAiRoutine] = user
    ? await Promise.all([
        getRoutineDayDetailsSafe(
          user.id,
          todayRoutines.map((r) => r.id),
        ),
        hasAnyAiRoutineSafe(user.id),
      ])
    : [new Map(), false];
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

  // "Today's Focus" hero — the AI routine's own title when today has one,
  // otherwise the scheduled strength routine(s)' name(s), otherwise a
  // genuine rest day. Mirrors the same fallback order the % card above uses.
  const focusDetail = todayAiRoutine?.detail;
  const focusTitle = focusDetail
    ? focusDetail.title
    : todayRoutines.length > 0
      ? todayRoutines.map((r) => r.name).join(", ")
      : todayCopy.focus.restTitle;
  const focusSubtitle = focusDetail
    ? focusDetail.estimatedMinutes != null
      ? todayCopy.focus.minutes(focusDetail.estimatedMinutes)
      : todayCopy.focus.exerciseCount(todayExercises.length)
    : todayRoutines.length > 0
      ? todayCopy.focus.exerciseCount(todayExercises.length)
      : todayCopy.focus.restSubtitle;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[15px] leading-[1.5] tracking-[-0.02em] text-text-secondary">
          {greetingPrefix}, <span className="font-semibold text-text-primary">{displayName}</span>
        </p>
        <h1 className="font-cormorant mt-1 text-[clamp(26px,6vw,32px)] leading-[1.25] font-semibold tracking-[-0.02em] text-text-primary">
          {dailyMessage}
        </h1>
      </div>

      {settings.selfLoveMessageEnabled && (
        <div className="glass-card flex items-start gap-3 p-6">
          <HeartIcon className="mt-1 h-5 w-5 shrink-0 text-pink-500" />
          <p className="text-[clamp(17px,4vw,20px)] leading-[1.65] font-light tracking-[-0.035em] text-text-primary">
            {mockToday.selfLoveMessage}
          </p>
        </div>
      )}

      <div className="glass-card p-5">
        <p className="font-en mb-3 text-[11px] font-semibold tracking-[0.14em] text-text-muted">
          {todayCopy.journey.label}
        </p>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-en text-[15px] font-semibold tracking-[-0.02em] text-text-primary">
            {todayCopy.journey.week(journey.currentWeek, journey.totalWeeks)}
          </span>
          <span className="font-en text-3xl font-semibold tracking-[-0.05em] text-text-primary">
            {journey.percent}%
          </span>
        </div>
        <div className="relative h-[3px] rounded-full" style={{ background: "var(--progress-track)" }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${journey.percent}%`, background: "var(--color-ink)" }}
          />
          <div
            className="absolute top-1/2 h-2.5 w-2.5 rounded-full"
            style={{ left: `${journey.percent}%`, transform: "translate(-50%, -50%)", background: "var(--color-ink)" }}
          />
        </div>
        <p className="font-en mt-2 text-right text-[10px] font-semibold tracking-[0.1em] text-text-muted">
          {todayCopy.journey.complete}
        </p>
      </div>

      <Link href="/move" className="glass-card flex items-center justify-between p-5">
        <div>
          <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.14em] text-text-muted">
            {todayCopy.focus.label}
          </p>
          <p className="font-cormorant text-[22px] leading-[1.2] font-semibold tracking-[-0.01em] text-text-primary">
            {focusTitle}
          </p>
          <p className="mt-1.5 text-[12px] text-text-secondary">{focusSubtitle}</p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--color-ink)" }}
        >
          <ChevronRightIcon className="h-4 w-4 text-text-inverse" />
        </div>
      </Link>

      <div className="glass-card grid grid-cols-3 gap-2 p-5">
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-en text-[10px] font-semibold tracking-[0.1em] text-text-muted">
            {todayCopy.stats.move}
          </span>
          <span className="font-en text-lg font-semibold text-text-primary">
            {moveAppliesToday ? `${Math.round(movePercent)}%` : todayCopy.stats.moveRest}
          </span>
        </div>
        {settings.mealTrackingEnabled && (
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-en text-[10px] font-semibold tracking-[0.1em] text-text-muted">
              {todayCopy.stats.nourish}
            </span>
            <span className="text-lg text-text-primary">{mealDoneToday ? "✓" : "–"}</span>
          </div>
        )}
        {settings.waterTrackingEnabled && (
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-en text-[10px] font-semibold tracking-[0.1em] text-text-muted">
              {todayCopy.stats.water}
            </span>
            <span className="font-en text-lg font-semibold text-text-primary">
              {cupsCurrent} / {cupsGoal}
            </span>
          </div>
        )}
      </div>

      {hasMoveToday && (
        <div className="glass-card p-5">
          <p className="mb-3 text-[15px] font-bold tracking-[-0.02em] text-text-primary">{todayCopy.movement.title}</p>
          <div className="flex flex-col gap-2">
            {workoutDoneSets > 0 && (
              <p className="text-[13px] text-text-secondary">
                {todayCopy.movement.strengthSets(workoutDoneSets, workoutTotalSets)}
              </p>
            )}
            {movementLogs.map((log) => {
              const config = ACTIVITY_CONFIG[log.activityType];
              return (
                <p key={log.id} className="text-[13px] text-text-secondary">
                  {config.emoji} {config.label} · {log.durationMinutes} min
                  {log.distanceKm != null ? ` · ${log.distanceKm}km` : ""}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {hasAnyAiRoutine && (
        <TodayAiRoutineCard
          detail={todayAiRoutine?.detail ?? null}
          exercises={todayAiRoutine?.routine.exercises ?? []}
        />
      )}

      {settings.mealTrackingEnabled && (
        <section>
          <div className="mb-3 flex items-center justify-between text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
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
        <p className="mb-3 text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
          {todayCopy.moment.title}
        </p>
        <DailyMemo date={todayIso} note={dailyNote} />
      </section>
    </div>
  );
}
