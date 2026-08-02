import Link from "next/link";
import { TodayBodyCard } from "@/components/body/TodayBodyCard";
import { TodayPlanCard } from "@/components/challenge/TodayPlanCard";
import { HeartIcon } from "@/components/icons";
import { todayIsoDate } from "@/lib/body/date";
import { getBodyEntriesSafe } from "@/lib/body/queries";
import { challengeDayNumber, challengePhase } from "@/lib/challenge/date";
import { getActiveChallengeSafe, getChallengeDayLogsSafe } from "@/lib/challenge/queries";
import { GOAL_LABELS } from "@/lib/challenge/types";
import { createClient } from "@/lib/supabase/server";
import { getRoutinesSafe } from "@/lib/workout/queries";

function startOfWeekIso(dateIso: string) {
  const date = new Date(`${dateIso}T00:00:00`);
  const diff = date.getDay() === 0 ? 6 : date.getDay() - 1;
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
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

  if (!challenge) {
    return (
      <div className="flex flex-col gap-5">
        <Header avatarUrl={avatarUrl} />
        <section className="glass-card overflow-hidden p-7">
          <p className="font-en mb-3 text-[11px] font-semibold tracking-[0.13em] text-pink-500 uppercase">Shape Me in 100 Days</p>
          <h1 className="mb-3 text-[31px] leading-[1.18] font-bold tracking-[-0.06em] text-text-primary">나를 위한 100일을 시작해볼까요?</h1>
          <p className="mb-7 text-[14px] leading-[1.75] text-text-secondary">현재 상태와 목표를 등록하면 반복해서 수행할 100일 운동 프로그램을 만들어드려요.</p>
          <Link href="/start" className="flex min-h-[54px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}>
            나의 100일 프로그램 만들기
          </Link>
        </section>
        <TodayBodyCard entry={todayBodyEntry} />
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
