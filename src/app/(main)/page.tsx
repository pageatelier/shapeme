import Link from "next/link";
import { DailyMemo } from "@/components/DailyMemo";
import { HomeHeader } from "@/components/HomeHeader";
import { HomeMealGrid } from "@/components/HomeMealGrid";
import { HomeWaterCard } from "@/components/HomeWaterCard";
import { HeartIcon } from "@/components/icons";
import { JournalForm } from "@/components/journal/JournalForm";
import { WaterGoalEditor } from "@/components/WaterGoalEditor";
import { TogetherStories } from "@/components/together/TogetherStories";
import { formatDateLabel, isoDateInTimeZone, weekdayIndex } from "@/lib/body/date";
import { movePercentFor, routineCompletionPercent } from "@/lib/dailyCompletion";
import { getCheersReceivedTodaySafe, getFriendsTodaySafe } from "@/lib/friends/queries";
import { getDailyMessage } from "@/lib/greeting";
import { getJournalEntryByDateSafe } from "@/lib/journal/queries";
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

  const metadata = user?.user_metadata as
    | { avatar_url?: string; display_name?: string; timezone?: string }
    | undefined;
  const avatarUrl = metadata?.avatar_url ?? null;
  const displayName = metadata?.display_name || "나";
  const timezone = metadata?.timezone || "Asia/Seoul";
  const settings = readSettings(user?.user_metadata);

  // One shared "today" for this page, resolved in the user's own timezone.
  const todayIso = isoDateInTimeZone(new Date(), timezone);
  const todayWeekday = WEEKDAYS[weekdayIndex(todayIso)];
  const dateLabel = `${formatDateLabel(todayIso)} ${todayWeekday}요일`;
  const dailyMessage = getDailyMessage(todayIso);

  // Independent reads — fetched together instead of one-after-another so
  // this page doesn't wait on 8 sequential round trips just to render.
  const [routines, movementLogs, water, meals, dailyNote, journalEntry, friends, receivedCheers] = user
    ? await Promise.all([
        getRoutinesSafe(user.id, todayIso),
        getMovementLogsByDateSafe(user.id, todayIso),
        getWaterLogsSafe(user.id, todayIso),
        getMealLogsSafe(user.id, todayIso),
        getDailyNoteSafe(user.id, todayIso),
        getJournalEntryByDateSafe(user.id, todayIso),
        getFriendsTodaySafe(),
        getCheersReceivedTodaySafe(user.id, todayIso),
      ])
    : [
        [],
        [],
        { entries: [], totalMl: 0 },
        MEAL_TYPES.map((type) => ({ type, date: todayIso, filled: false })),
        { memo: null, isPublic: false },
        null,
        [],
        [],
      ];

  // Strict match only — if nothing is scheduled for today's weekday, that's
  // a real "no routine today", not a reason to fall back to some other routine.
  const todayRoutine = routines.find((r) => r.days.includes(todayWeekday)) ?? null;
  const todayExercises = todayRoutine?.exercises ?? [];
  const workoutDoneSets = todayExercises.reduce((sum, e) => sum + e.sets.filter(Boolean).length, 0);
  const workoutTotalSets = todayExercises.reduce((sum, e) => sum + e.targetSets, 0);

  const hasMoveToday = workoutDoneSets > 0 || movementLogs.length > 0;

  const waterPct = Math.min(100, Math.round((water.totalMl / settings.waterGoalMl) * 100));

  // "오늘의 루틴" card — Move/식단/물만(Body/Journal aren't part of this
  // card; they're still reachable from the bottom nav). There's no stored
  // "목표 시간" for simple (non-strength) movement logs, so — since there's
  // nothing to compare against — any logged entry on a day with no active
  // strength routine counts as full Move credit for that day; flagged here
  // since it's the one place this diverges from a literal reading of the
  // spec's "완료 시간 / 목표 시간" formula. Shared with My's calendar/detail
  // via movePercentFor/routineCompletionPercent so the number always matches.
  const movePercent = movePercentFor({
    workoutDoneSets,
    workoutTotalSets,
    hasMovementLog: movementLogs.length > 0,
  });
  const mealDoneToday = meals.some((m) => m.filled);

  const todayRoutinePercent = routineCompletionPercent({
    movePercent,
    mealDoneToday,
    waterPct,
    mealTrackingEnabled: settings.mealTrackingEnabled,
    waterTrackingEnabled: settings.waterTrackingEnabled,
  });

  const cupsRemaining = Math.max(0, Math.ceil((settings.waterGoalMl - water.totalMl) / settings.cupMl));

  const routineChecklist = [
    { key: "move", done: hasMoveToday, doneLabel: "운동 진행 중", todoLabel: "운동 계속하기", href: "/move" },
    ...(settings.mealTrackingEnabled
      ? [{ key: "meal", done: mealDoneToday, doneLabel: "식단 기록 완료", todoLabel: "식단 기록하기", href: "/meal" }]
      : []),
    ...(settings.waterTrackingEnabled
      ? [
          {
            key: "water",
            done: waterPct >= 100,
            doneLabel: "물 섭취 완료",
            todoLabel: `물 ${cupsRemaining}잔 더 마시기`,
            href: "/water",
          },
        ]
      : []),
  ];

  const myPublicMemo = dailyNote.isPublic ? dailyNote.memo : null;
  const cheerNotifications = receivedCheers.map((cheer) => ({
    senderId: cheer.senderId,
    displayName: friends.find((f) => f.friendId === cheer.senderId)?.displayName ?? "친구",
    type: cheer.type,
  }));

  return (
    <div className="flex flex-col gap-5">
      <HomeHeader cheerNotifications={cheerNotifications} />

      <TogetherStories
        me={{ displayName, avatarUrl, todayProgress: todayRoutinePercent, memo: myPublicMemo }}
        friends={friends}
      />

      <div>
        <p className="font-en mb-1.5 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
          {dateLabel}
        </p>
        <p className="text-[15px] leading-[1.5] tracking-[-0.02em] text-text-secondary">
          세상에서 가장 소중한 <span className="font-bold text-text-primary">{displayName}</span>님 🌷
        </p>
        <h1 className="mt-1 text-[clamp(22px,5vw,26px)] leading-[1.3] font-bold tracking-[-0.04em] text-text-primary">
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
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">오늘의 루틴</p>
          <p className="font-en text-2xl font-semibold tracking-[-0.05em] text-text-primary">
            {todayRoutinePercent}%
          </p>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${todayRoutinePercent}%`, background: "var(--gradient-primary)" }}
          />
        </div>
        <div className="flex flex-col gap-2">
          {routineChecklist.map((item) =>
            item.done ? (
              <p key={item.key} className="flex items-center gap-2 text-[13px] text-text-secondary">
                <span className="text-success">✓</span> {item.doneLabel}
              </p>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center gap-2 text-[13px] font-semibold text-text-primary"
              >
                <span className="text-text-muted">○</span> {item.todoLabel}
              </Link>
            ),
          )}
        </div>
      </div>

      {hasMoveToday && (
        <div className="glass-card p-5">
          <p className="mb-3 text-[15px] font-bold tracking-[-0.02em] text-text-primary">오늘의 움직임</p>
          <div className="flex flex-col gap-2">
            {workoutDoneSets > 0 && (
              <p className="text-[13px] text-text-secondary">
                🏋️ 근력운동 {workoutDoneSets}/{workoutTotalSets}세트
              </p>
            )}
            {movementLogs.map((log) => {
              const config = ACTIVITY_CONFIG[log.activityType];
              return (
                <p key={log.id} className="text-[13px] text-text-secondary">
                  {config.emoji} {config.label} {log.durationMinutes}분
                  {log.distanceKm != null ? ` · ${log.distanceKm}km` : ""}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {settings.mealTrackingEnabled && (
        <section>
          <div className="mb-3 flex items-center justify-between text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
            오늘의 식단
            <Link href="/meal" className="font-en text-[11px] font-semibold tracking-[0.03em] text-text-muted lowercase">
              편집
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
          오늘의 메모
        </p>
        <DailyMemo date={todayIso} note={dailyNote} />
      </section>

      <section>
        <p className="mb-3 text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">Journal</p>
        <JournalForm
          date={todayIso}
          initialMood={journalEntry?.mood ?? null}
          initialDayText={journalEntry?.dayText ?? ""}
          initialGoodThing={journalEntry?.goodThing ?? ""}
        />
      </section>
    </div>
  );
}
