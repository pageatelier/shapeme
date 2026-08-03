import Image from "next/image";
import Link from "next/link";
import { DailyMemo } from "@/components/DailyMemo";
import { HomeHeader } from "@/components/HomeHeader";
import { HomeMealGrid } from "@/components/HomeMealGrid";
import { HomeWaterCard } from "@/components/HomeWaterCard";
import { CameraIcon, HeartIcon, MoveIcon, NoteIcon } from "@/components/icons";
import { WaterGoalEditor } from "@/components/WaterGoalEditor";
import { TogetherStories } from "@/components/together/TogetherStories";
import { formatDateLabel, isoDateInTimeZone, weekdayIndex } from "@/lib/body/date";
import { getBodyEntryByDateSafe } from "@/lib/body/queries";
import { primaryPhotoUrl } from "@/lib/body/types";
import { dayCompletionPercent } from "@/lib/dailyCompletion";
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
import { createClient } from "@/lib/supabase/server";
import { getWaterLogsSafe } from "@/lib/water/queries";
import { getRoutinesSafe } from "@/lib/workout/queries";
import { WEEKDAYS } from "@/lib/workout/types";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata as
    | { avatar_url?: string; display_name?: string; timezone?: string }
    | undefined;
  const avatarUrl = metadata?.avatar_url ?? null;
  const displayName = metadata?.display_name || "나";
  const timezone = metadata?.timezone || "Asia/Seoul";
  const settings = readSettings(user?.user_metadata);

  // One shared "today" for this page, resolved in the user's own timezone —
  // Body/Move/Journal moments and the greeting date all agree on the same day.
  const todayIso = isoDateInTimeZone(new Date(), timezone);
  const todayWeekday = WEEKDAYS[weekdayIndex(todayIso)];
  const dateLabel = `${formatDateLabel(todayIso)} ${todayWeekday}요일`;
  const dailyMessage = getDailyMessage(todayIso);

  const todayBodyEntry = user ? await getBodyEntryByDateSafe(user.id, todayIso) : null;
  const bodyPhotoCount = todayBodyEntry
    ? [todayBodyEntry.front, todayBodyEntry.side, todayBodyEntry.back].filter(Boolean).length
    : 0;
  const hasBodyToday = bodyPhotoCount > 0;
  const bodyThumbnailUrl = todayBodyEntry ? (primaryPhotoUrl(todayBodyEntry) ?? null) : null;

  const routines = user ? await getRoutinesSafe(user.id, todayIso) : [];
  // Strict match only — if nothing is scheduled for today's weekday, that's
  // a real "no routine today", not a reason to fall back to some other routine.
  const todayRoutine = routines.find((r) => r.days.includes(todayWeekday)) ?? null;
  const todayExercises = todayRoutine?.exercises ?? [];
  const workoutDoneSets = todayExercises.reduce((sum, e) => sum + e.sets.filter(Boolean).length, 0);
  const workoutTotalSets = todayExercises.reduce((sum, e) => sum + e.targetSets, 0);
  const workoutPct = workoutTotalSets > 0 ? (workoutDoneSets / workoutTotalSets) * 100 : 0;

  const movementLogs = user ? await getMovementLogsByDateSafe(user.id, todayIso) : [];
  const hasMoveToday = workoutDoneSets > 0 || movementLogs.length > 0;
  const moveSummary =
    [
      workoutDoneSets > 0 ? `${todayRoutine?.name ?? "루틴"} ${workoutDoneSets}/${workoutTotalSets}세트` : null,
      movementLogs.length > 0
        ? `${ACTIVITY_CONFIG[movementLogs[0].activityType].label} ${movementLogs[0].durationMinutes}분`
        : null,
    ]
      .filter(Boolean)
      .join(" · ") || null;

  const journalEntry = user ? await getJournalEntryByDateSafe(user.id, todayIso) : null;
  const hasJournalToday = !!journalEntry;

  const momentsCount = [hasBodyToday, hasMoveToday, hasJournalToday].filter(Boolean).length;

  // Kept purely to feed the existing friend-story completion ring below —
  // that social feature stays exactly as it was, water/meal included.
  const water = user ? await getWaterLogsSafe(user.id, todayIso) : { entries: [], totalMl: 0 };
  const waterPct = Math.min(100, Math.round((water.totalMl / settings.waterGoalMl) * 100));
  const meals = user
    ? await getMealLogsSafe(user.id, todayIso)
    : MEAL_TYPES.map((type) => ({ type, date: todayIso, filled: false }));
  const mealPct = Math.min(100, (meals.filter((m) => m.filled).length / 4) * 100);
  const bodyPct = hasBodyToday ? 100 : 0;
  const completionRate = dayCompletionPercent({ workoutPct, waterPct, mealPct, bodyPct });

  const dailyNote = user ? await getDailyNoteSafe(user.id, todayIso) : { memo: null, isPublic: false };
  const myPublicMemo = dailyNote.isPublic ? dailyNote.memo : null;
  const friends = user ? await getFriendsTodaySafe() : [];
  const receivedCheers = user ? await getCheersReceivedTodaySafe(user.id, todayIso) : [];
  const cheerNotifications = receivedCheers.map((cheer) => ({
    displayName: friends.find((f) => f.friendId === cheer.senderId)?.displayName ?? "친구",
    type: cheer.type,
  }));

  const recordCards = [
    {
      key: "body",
      label: "Body",
      href: "/body",
      Icon: CameraIcon,
      thumbnailUrl: bodyThumbnailUrl,
      hasRecord: hasBodyToday,
      summary: hasBodyToday ? `사진 ${bodyPhotoCount}장` : null,
    },
    {
      key: "move",
      label: "Move",
      href: "/move",
      Icon: MoveIcon,
      thumbnailUrl: null,
      hasRecord: hasMoveToday,
      summary: moveSummary,
    },
    {
      key: "journal",
      label: "Journal",
      href: "/journal",
      Icon: NoteIcon,
      thumbnailUrl: null,
      hasRecord: hasJournalToday,
      summary: hasJournalToday ? (journalEntry?.mood ?? "기록 완료") : null,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <HomeHeader cheerNotifications={cheerNotifications} />

      <TogetherStories
        me={{ displayName, avatarUrl, todayProgress: completionRate, memo: myPublicMemo }}
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

      <div className="grid grid-cols-3 gap-3">
        {recordCards.map(({ key, label, href, Icon, thumbnailUrl, hasRecord, summary }) => (
          <Link key={key} href={href} className="surface-card flex flex-col items-center gap-1.5 p-4 text-center">
            {thumbnailUrl ? (
              <div
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
                style={{ boxShadow: "var(--shadow-pink)" }}
              >
                <Image src={thumbnailUrl} alt="" fill sizes="40px" className="object-cover" />
              </div>
            ) : (
              <Icon className="h-[22px] w-[22px] text-peach-400" />
            )}
            <p className="text-[13px] font-bold tracking-[-0.02em] text-text-primary">{label}</p>
            <p className="line-clamp-1 text-[11px] leading-tight text-text-secondary">
              {hasRecord ? summary : "미기록"}
            </p>
          </Link>
        ))}
      </div>

      <div className="glass-card p-5">
        <p className="mb-3 text-[15px] font-bold tracking-[-0.02em] text-text-primary">
          오늘 나를 돌본 순간 {momentsCount}개를 남겼어요
        </p>
        <div className="flex flex-col gap-2.5">
          {recordCards.map(({ key, label, href, hasRecord, summary }) =>
            hasRecord ? (
              <p key={key} className="text-[13px] leading-relaxed text-text-secondary">
                <span className="font-bold text-text-primary">{label}</span> · {summary}
              </p>
            ) : (
              <div key={key} className="flex items-center justify-between gap-2">
                <p className="text-[13px] text-text-muted">
                  <span className="font-semibold text-text-secondary">{label}</span> · 아직 오늘의 기록이 없어요
                </p>
                <Link
                  href={href}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-inverse"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  기록하기
                </Link>
              </div>
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
    </div>
  );
}
