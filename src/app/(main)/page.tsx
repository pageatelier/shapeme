import Link from "next/link";
import { DailyMemo } from "@/components/DailyMemo";
import { ProgressRing } from "@/components/ProgressRing";
import { SetDots } from "@/components/SetDots";
import { TodayBodyCard } from "@/components/body/TodayBodyCard";
import { TodayPlanCard } from "@/components/challenge/TodayPlanCard";
import { HeartIcon } from "@/components/icons";
import { todayIsoDate, weekdayIndex } from "@/lib/body/date";
import { getBodyEntriesSafe } from "@/lib/body/queries";
import { addDays, challengeDayNumber, challengePhase } from "@/lib/challenge/date";
import { getActiveChallengeSafe, getChallengeDayLogsSafe } from "@/lib/challenge/queries";
import { GOAL_LABELS } from "@/lib/challenge/types";
import { completionMessages, today } from "@/lib/mock-data";
import { getDailyNoteSafe } from "@/lib/notes/queries";
import { createClient } from "@/lib/supabase/server";
import { getRoutinesSafe } from "@/lib/workout/queries";
import { WEEKDAYS } from "@/lib/workout/types";

// Monday-start week containing `dateIso`, computed with UTC-anchored
// calendar math only (see weekdayIndex/addDays) — never through an
// ambient-local-timezone `new Date(...).toISOString()` round trip, which
// silently returns the wrong day once the server (or a Korean dev machine)
// isn't running in UTC.
function startOfWeekIso(dateIso: string) {
  const day = weekdayIndex(dateIso);
  const diff = day === 0 ? 6 : day - 1;
  return addDays(dateIso, -diff);
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const avatarUrl = (user?.user_metadata as { avatar_url?: string } | undefined)?.avatar_url ?? null;
  const todayIso = todayIsoDate();
  const bodyEntries = user ? await getBodyEntriesSafe(user.id) : [];
  const todayBodyEntry = bodyEntries.find((entry) => entry.date === todayIso) ?? null;
  const challenge = user ? await getActiveChallengeSafe(user.id) : null;

  // No active 100-day program: the plain, ongoing self-management dashboard.
  // The challenge is an opt-in extra, reachable from the card at the bottom
  // (and from My) rather than something new users are forced through.
  if (!challenge) {
    const todayWeekday = WEEKDAYS[weekdayIndex(todayIso)];
    const routines = user ? await getRoutinesSafe(user.id, todayIso, null) : [];
    const todayRoutine = routines.find((routine) => routine.days.includes(todayWeekday)) ?? null;
    const todayExercises = todayRoutine?.exercises ?? [];
    const workoutDoneSets = todayExercises.reduce((sum, exercise) => sum + exercise.sets.filter(Boolean).length, 0);
    const workoutTotalSets = todayExercises.reduce((sum, exercise) => sum + exercise.targetSets, 0);
    const workoutPct = workoutTotalSets > 0 ? (workoutDoneSets / workoutTotalSets) * 100 : 0;
    const bodyPct = todayBodyEntry && (todayBodyEntry.front || todayBodyEntry.side || todayBodyEntry.back) ? 100 : 0;
    const completionRate = Math.round((workoutPct + bodyPct) / 2);
    const heroMessage = completionMessages.find((message) => completionRate >= message.min)?.message ?? "";
    const dailyNote = user ? await getDailyNoteSafe(user.id, todayIso) : null;

    return (
      <div className="flex flex-col gap-5">
        <Header avatarUrl={avatarUrl} />

        <TodayBodyCard entry={todayBodyEntry} />

        <div>
          <p className="font-en mb-1.5 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
            {today.dateLabel}
          </p>
          <h1 className="text-[clamp(22px,5vw,26px)] leading-[1.3] font-bold tracking-[-0.04em] whitespace-pre-line text-text-primary">
            {today.greeting}
          </h1>
        </div>

        <div className="glass-card flex items-start gap-3 p-6">
          <HeartIcon className="mt-1 h-5 w-5 shrink-0 text-pink-500" />
          <p className="text-[clamp(17px,4vw,20px)] leading-[1.65] font-light tracking-[-0.035em] text-text-primary">
            {today.selfLoveMessage}
          </p>
        </div>

        <div className="glass-card flex items-center gap-6 px-6 py-7">
          <ProgressRing percent={completionRate} />
          <div>
            <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
              today&apos;s progress
            </p>
            <p className="mb-1 text-[15px] font-bold tracking-[-0.02em] text-text-primary">
              오늘 {completionRate}% 완료했어요
            </p>
            <p className="text-[13px] leading-[1.55] tracking-[-0.01em] text-text-secondary">{heroMessage}</p>
          </div>
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
                  <p className="mb-1 text-[15px] font-bold tracking-[-0.02em] text-text-primary">{exercise.name}</p>
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
          <p className="mb-3 text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
            오늘의 메모
          </p>
          <DailyMemo date={todayIso} memo={dailyNote} />
        </section>

        <section className="glass-card p-6 text-center">
          <p className="mb-1 text-[15px] font-bold text-text-primary">나를 위한 100일을 시작해볼까요?</p>
          <p className="mb-5 text-[13px] leading-relaxed text-text-secondary">
            현재 상태와 목표를 등록하면 반복해서 수행할 100일 운동 프로그램을 만들어드려요. 언제든 시작할 수 있어요.
          </p>
          <Link
            href="/start"
            className="flex min-h-[50px] items-center justify-center rounded-full text-[14px] font-bold text-text-inverse"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
          >
            100일 챌린지 시작하기
          </Link>
        </section>
      </div>
    );
  }

  const day = Math.max(1, Math.min(100, challengeDayNumber(challenge.startDate, todayIso)));
  const phase = challengePhase(day);
  const logs = user ? await getChallengeDayLogsSafe(user.id, challenge.id, challenge.startDate, todayIso) : [];
  const routines = user ? await getRoutinesSafe(user.id, todayIso, challenge.id) : [];
  const todayLog = logs.find((log) => log.logDate === todayIso) ?? null;
  const completedWorkoutCount = logs.filter((log) => log.status === "workout" && log.logDate !== todayIso).length;
  const activeRoutine = todayLog?.routineId
    ? routines.find((routine) => routine.id === todayLog.routineId) ?? routines[completedWorkoutCount % Math.max(1, routines.length)] ?? null
    : routines[completedWorkoutCount % Math.max(1, routines.length)] ?? null;
  const totalSets = activeRoutine?.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0) ?? 0;
  const weekStart = startOfWeekIso(todayIso);
  const weekWorkouts = logs.filter((log) => log.status === "workout" && log.logDate >= weekStart && log.logDate <= todayIso).length;
  const recoveryDays = logs.filter((log) => log.status === "recovery").length;
  const programProgress = Math.min(100, day);

  return (
    <div className="flex flex-col gap-5">
      <Header avatarUrl={avatarUrl} />

      <section className="glass-card p-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-en mb-1 text-[11px] font-semibold tracking-[0.12em] text-pink-500 uppercase">Shape Me in 100 Days</p>
            <h1 className="text-[31px] font-semibold tracking-[-0.065em] text-text-primary">Day {day} <span className="text-[18px] font-medium text-text-muted">of 100</span></h1>
          </div>
          <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-secondary" style={{ background: "var(--surface-card)" }}>{phase.title}</span>
        </div>
        <div className="mb-3 h-2.5 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}>
          <div className="h-full rounded-full" style={{ width: `${programProgress}%`, background: "var(--gradient-primary)" }} />
        </div>
        <div className="flex items-center justify-between text-[11px] text-text-muted">
          <span>{GOAL_LABELS[challenge.goal]}</span>
          <span>{programProgress}%</span>
        </div>
      </section>

      <TodayBodyCard entry={todayBodyEntry} challengeDay={day} />

      <TodayPlanCard
        challengeId={challenge.id}
        date={todayIso}
        routineName={activeRoutine?.name ?? null}
        exerciseCount={activeRoutine?.exercises.length ?? 0}
        totalSets={totalSets}
        sessionMinutes={challenge.sessionMinutes}
        todayLog={todayLog}
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard value={`${weekWorkouts}/${challenge.workoutDaysPerWeek}`} label="이번 주 운동" />
        <StatCard value={`${completedWorkoutCount + (todayLog?.status === "workout" ? 1 : 0)}`} label="완료 세션" />
        <StatCard value={`${recoveryDays}`} label="회복일" />
      </div>

      <section className="surface-card flex items-start gap-3 p-5">
        <HeartIcon className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
        <div>
          <p className="mb-1 text-[13px] font-bold text-text-primary">{phase.description}</p>
          <p className="text-[12px] leading-relaxed text-text-secondary">완벽하게 해내는 것보다 다시 이어가는 힘이 더 중요해요.</p>
        </div>
      </section>
    </div>
  );
}

function Header({ avatarUrl }: { avatarUrl: string | null }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-en text-2xl font-medium tracking-[-0.055em] text-text-primary">ShapeMe</span>
      <Link href="/my" className="block h-10 w-10 overflow-hidden rounded-full" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-xs)" }}>
        {avatarUrl && <img src={avatarUrl} alt="프로필 사진" className="h-full w-full object-cover" />}
      </Link>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="surface-card px-3 py-4 text-center">
      <p className="font-en mb-1 text-[20px] font-semibold tracking-[-0.045em] text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted">{label}</p>
    </div>
  );
}
