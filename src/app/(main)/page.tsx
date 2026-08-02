import Link from "next/link";
import { DailyMemo } from "@/components/DailyMemo";
import { HomeHeader } from "@/components/HomeHeader";
import { HomeMealGrid } from "@/components/HomeMealGrid";
import { HomeWaterCard } from "@/components/HomeWaterCard";
import { ProgressRing } from "@/components/ProgressRing";
import { SetDots } from "@/components/SetDots";
import { DumbbellIcon, HeartIcon, MealIcon, WaterDropIcon } from "@/components/icons";
import { TogetherStories } from "@/components/together/TogetherStories";
import { todayIsoDate, weekdayIndex } from "@/lib/body/date";
import { getBodyEntryByDateSafe } from "@/lib/body/queries";
import { dayCompletionPercent } from "@/lib/dailyCompletion";
import { getCheersReceivedTodaySafe, getFriendsTodaySafe } from "@/lib/friends/queries";
import { getDailyMessage } from "@/lib/greeting";
import { getMealLogsSafe } from "@/lib/meal/queries";
import { MEAL_TYPES } from "@/lib/meal/types";
import { completionMessages, today } from "@/lib/mock-data";
import { getDailyNoteSafe } from "@/lib/notes/queries";
import { readSettings } from "@/lib/settings/types";
import { createClient } from "@/lib/supabase/server";
import { getWaterLogsSafe } from "@/lib/water/queries";
import { getRoutinesSafe } from "@/lib/workout/queries";
import { WEEKDAYS } from "@/lib/workout/types";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata as { avatar_url?: string; display_name?: string } | undefined;
  const avatarUrl = metadata?.avatar_url ?? null;
  const displayName = metadata?.display_name || "나";
  const settings = readSettings(user?.user_metadata);

  const todayIso = todayIsoDate();
  const dailyMessage = getDailyMessage(todayIso);
  const todayBodyEntry = user ? await getBodyEntryByDateSafe(user.id, todayIso) : null;

  const routines = user ? await getRoutinesSafe(user.id, todayIso) : [];
  const todayWeekday = WEEKDAYS[weekdayIndex(todayIso)];
  // Strict match only — if nothing is scheduled for today's weekday, that's
  // a real "no workout today", not a reason to fall back to some other routine.
  const todayRoutine = routines.find((r) => r.days.includes(todayWeekday)) ?? null;
  const todayExercises = todayRoutine?.exercises ?? [];
  const workoutDoneSets = todayExercises.reduce((sum, e) => sum + e.sets.filter(Boolean).length, 0);
  const workoutTotalSets = todayExercises.reduce((sum, e) => sum + e.targetSets, 0);
  const workoutPct = workoutTotalSets > 0 ? (workoutDoneSets / workoutTotalSets) * 100 : 0;

  const water = user ? await getWaterLogsSafe(user.id, todayIso) : { entries: [], totalMl: 0 };
  const waterPercent = Math.round((water.totalMl / settings.waterGoalMl) * 100);
  const waterPct = Math.min(100, waterPercent);

  const meals = user
    ? await getMealLogsSafe(user.id, todayIso)
    : MEAL_TYPES.map((type) => ({ type, date: todayIso, filled: false }));
  const mealsFilledCount = meals.filter((m) => m.filled).length;
  const mealPct = Math.min(100, (mealsFilledCount / 4) * 100);

  const bodyPct = todayBodyEntry && (todayBodyEntry.front || todayBodyEntry.side || todayBodyEntry.back) ? 100 : 0;

  const completionRate = dayCompletionPercent({ workoutPct, waterPct, mealPct, bodyPct });
  const heroMessage = completionMessages.find((m) => completionRate >= m.min)?.message ?? "";

  const dailyNote = user ? await getDailyNoteSafe(user.id, todayIso) : null;
  const friends = user ? await getFriendsTodaySafe() : [];
  const cheerSenderIds = user ? await getCheersReceivedTodaySafe(user.id, todayIso) : [];
  const cheerSenderNames = cheerSenderIds.map(
    (id) => friends.find((f) => f.friendId === id)?.displayName ?? "친구",
  );

  return (
    <div className="flex flex-col gap-5">
      <HomeHeader cheerSenderNames={cheerSenderNames} />

      <TogetherStories
        me={{ displayName, avatarUrl, todayProgress: completionRate }}
        friends={friends}
      />

      <div>
        <p className="font-en mb-1.5 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
          {today.dateLabel}
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
            {today.selfLoveMessage}
          </p>
        </div>
      )}

      <div className="glass-card flex items-center gap-6 px-6 py-7">
        <ProgressRing percent={completionRate} />
        <div>
          <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
            today&apos;s progress
          </p>
          <p className="mb-1 text-[15px] font-bold tracking-[-0.02em] text-text-primary">
            오늘 {completionRate}% 완료했어요
          </p>
          <p className="text-[13px] leading-[1.55] tracking-[-0.01em] text-text-secondary">
            {heroMessage}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/workout" className="surface-card flex flex-col items-center p-4 text-center">
          <DumbbellIcon className="mb-2 h-[22px] w-[22px] text-peach-400" />
          <p className="font-en text-lg font-semibold tracking-[-0.03em] text-text-primary">
            {workoutDoneSets}/{workoutTotalSets}
          </p>
          <p className="text-[11px] text-text-muted">workout</p>
        </Link>
        <Link href="/water" className="surface-card flex flex-col items-center p-4 text-center">
          <WaterDropIcon className="mb-2 h-[22px] w-[22px] text-pink-400" />
          <p className="font-en text-lg font-semibold tracking-[-0.03em] text-text-primary">
            {(water.totalMl / 1000).toFixed(1)}L
          </p>
          <p className="text-[11px] text-text-muted">water</p>
        </Link>
        <Link href="/meal" className="surface-card flex flex-col items-center p-4 text-center">
          <MealIcon className="mb-2 h-[22px] w-[22px] text-peach-400" />
          <p className="font-en text-lg font-semibold tracking-[-0.03em] text-text-primary">
            {mealsFilledCount}/4
          </p>
          <p className="text-[11px] text-text-muted">meals</p>
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
          오늘의 운동 {todayRoutine && <span className="text-text-muted">· {todayRoutine.name}</span>}
          <Link href="/workout" className="font-en text-[11px] font-semibold tracking-[0.03em] text-text-muted lowercase">
            edit
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {todayExercises.length === 0 && (
            <Link href="/workout" className="surface-card p-4 text-center text-[13px] text-text-muted">
              {routines.length === 0
                ? "아직 운동 루틴이 없어요. 눌러서 만들어보세요."
                : "오늘 요일에 예정된 루틴이 없어요."}
            </Link>
          )}
          {todayExercises.map((exercise) => (
            <div key={exercise.id} className="surface-card flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[15px] font-bold tracking-[-0.02em] text-text-primary">
                  {exercise.name}
                </p>
                <p className="text-[13px] text-text-muted">
                  {exercise.sets.filter(Boolean).length} / {exercise.targetSets}세트 · {exercise.targetReps}회
                </p>
              </div>
              <SetDots sets={exercise.sets} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
          오늘의 식단
          <Link href="/meal" className="font-en text-[11px] font-semibold tracking-[0.03em] text-text-muted lowercase">
            add
          </Link>
        </div>
        <HomeMealGrid meals={meals} />
      </section>

      <HomeWaterCard
        date={todayIso}
        entries={water.entries}
        totalMl={water.totalMl}
        goalMl={settings.waterGoalMl}
        cupMl={settings.cupMl}
      />

      <section>
        <p className="mb-3 text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
          오늘의 메모
        </p>
        <DailyMemo date={todayIso} memo={dailyNote} />
      </section>
    </div>
  );
}
