"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EditIcon, PlusIcon } from "@/components/icons";
import { clearChallengeDayLog, saveWorkoutCompletion } from "@/lib/challenge/mutations";
import { challengePhase } from "@/lib/challenge/date";
import type { Challenge, ChallengeDayLog, WorkoutEffort } from "@/lib/challenge/types";
import type { WorkoutRoutine } from "@/lib/workout/types";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseForm } from "./ExerciseForm";
import { RoutineForm } from "./RoutineForm";

export function WorkoutView({
  routines,
  date,
  challenge,
  challengeDay,
  activeRoutineId,
  todayLog,
}: {
  routines: WorkoutRoutine[];
  date: string;
  challenge: Challenge | null;
  challengeDay: number | null;
  activeRoutineId: string | null;
  todayLog: ChallengeDayLog | null;
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(activeRoutineId ?? routines[0]?.id ?? null);
  const [editingRoutine, setEditingRoutine] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [effort, setEffort] = useState<WorkoutEffort>(todayLog?.effort ?? "good");
  const [pain, setPain] = useState(todayLog?.pain ?? false);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const initialSetState = useMemo(
    () => new Map(routines.flatMap((routine) => routine.exercises.map((exercise) => [exercise.id, exercise.sets] as const))),
    [routines],
  );
  const [setState, setSetState] = useState(initialSetState);

  const activeRoutine = routines.find((routine) => routine.id === activeId) ?? routines[0] ?? null;
  const totalSets = activeRoutine?.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0) ?? 0;
  const doneSets = activeRoutine?.exercises.reduce((sum, exercise) => sum + (setState.get(exercise.id) ?? exercise.sets).filter(Boolean).length, 0) ?? 0;
  const progress = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
  const complete = totalSets > 0 && doneSets === totalSets;
  const phase = challengeDay ? challengePhase(challengeDay) : null;

  function updateSets(exerciseId: string, sets: boolean[]) {
    setSetState((current) => {
      const next = new Map(current);
      next.set(exerciseId, sets);
      return next;
    });
  }

  async function finishWorkout() {
    if (!challenge || !activeRoutine || !complete) return;
    setSavingCompletion(true);
    setCompletionError(null);
    try {
      await saveWorkoutCompletion({
        challengeId: challenge.id,
        date,
        routineId: activeRoutine.id,
        effort,
        pain,
        completedSets: doneSets,
        totalSets,
      });
      router.refresh();
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : "운동 완료 기록을 저장하지 못했어요.");
    } finally {
      setSavingCompletion(false);
    }
  }

  async function undoDayLog() {
    if (!challenge) return;
    setSavingCompletion(true);
    try {
      await clearChallengeDayLog(challenge.id, date);
      router.refresh();
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : "기록을 되돌리지 못했어요.");
    } finally {
      setSavingCompletion(false);
    }
  }

  if (!challenge) {
    return (
      <div className="flex flex-col gap-5">
        <div><h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">운동</h1></div>
        <div className="glass-card p-7 text-center">
          <p className="mb-2 text-[18px] font-bold text-text-primary">먼저 100일 프로그램을 만들어주세요</p>
          <p className="mb-6 text-[13px] leading-relaxed text-text-secondary">목표와 운동 환경에 맞춘 고정 루틴이 이곳에 표시돼요.</p>
          <Link href="/start" className="inline-flex min-h-[50px] items-center justify-center rounded-full px-6 text-[14px] font-bold text-text-inverse" style={{ background: "var(--gradient-primary)" }}>프로그램 만들기</Link>
        </div>
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">100일 운동</h1>
        <div className="glass-card p-7 text-center">
          <p className="mb-2 text-[16px] font-bold text-text-primary">프로그램을 찾지 못했어요</p>
          <p className="mb-5 text-[13px] leading-relaxed text-text-secondary">새 100일 프로그램을 다시 만들면 운동 루틴이 자동으로 생성돼요.</p>
          <Link href="/start" className="font-semibold text-pink-500">다시 만들기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="font-en mb-1.5 text-[11px] font-semibold tracking-[0.11em] text-pink-500 uppercase">Day {challengeDay ?? 1} · {phase?.title}</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-primary">100일 운동</h1>
            <p className="mt-1 text-[12px] text-text-muted">루틴은 유지하고 기록에 따라 조금씩 성장해요.</p>
          </div>
          <button type="button" onClick={() => setEditingRoutine((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary" style={{ background: "rgba(255,255,255,0.72)", border: "var(--border-soft)" }} aria-label="루틴 편집"><EditIcon className="h-4 w-4" /></button>
        </div>
      </header>

      {todayLog?.status === "recovery" && (
        <div className="surface-card p-5">
          <p className="mb-1 text-[14px] font-bold text-text-primary">오늘은 회복일로 기록했어요</p>
          <p className="mb-3 text-[12px] leading-relaxed text-text-secondary">운동하고 싶다면 회복일을 취소한 뒤 세트를 진행할 수 있어요.</p>
          <button type="button" onClick={undoDayLog} disabled={savingCompletion} className="text-[12px] font-semibold text-pink-500">회복일 취소</button>
        </div>
      )}

      {todayLog?.status === "workout" && (
        <div className="surface-card p-5" style={{ background: "var(--color-success-soft)" }}>
          <p className="mb-1 text-[14px] font-bold text-text-primary">오늘 운동 완료 ✓</p>
          <p className="text-[12px] text-text-secondary">{todayLog.completedSets}/{todayLog.totalSets}세트를 기록했어요.</p>
        </div>
      )}

      {editingRoutine && activeRoutine && <RoutineForm orderIndex={activeRoutine.orderIndex} routine={activeRoutine} onDone={() => setEditingRoutine(false)} />}

      <div className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-en mb-1 text-[11px] font-semibold tracking-[0.1em] text-text-muted uppercase">Session progress</p>
            <p className="text-[16px] font-bold tracking-[-0.025em] text-text-primary">{doneSets} / {totalSets}세트 완료</p>
          </div>
          <div className="font-en text-3xl font-semibold tracking-[-0.055em] text-text-primary">{progress}<span className="text-sm text-text-muted">%</span></div>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--gradient-primary)" }} /></div>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {routines.map((routine, index) => {
          const active = routine.id === activeRoutine?.id;
          return (
            <button key={routine.id} type="button" onClick={() => setActiveId(routine.id)} className="shrink-0 rounded-full px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap" style={active ? { background: "var(--gradient-primary)", color: "var(--color-text-inverse)", boxShadow: "var(--shadow-pink)" } : { background: "var(--surface-card)", color: "var(--color-text-secondary)", border: "var(--border-soft)" }}>
              Session {String.fromCharCode(65 + index)}
            </button>
          );
        })}
      </div>

      {activeRoutine && (
        <div>
          <p className="mb-1 text-[19px] font-bold tracking-[-0.035em] text-text-primary">{activeRoutine.name}</p>
          <p className="text-[12px] text-text-muted">{activeRoutine.exercises.length}개 운동 · 약 {challenge.sessionMinutes}분</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {activeRoutine?.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            date={date}
            orderIndex={index}
            onSetsChange={updateSets}
            prev={index > 0 ? { id: activeRoutine.exercises[index - 1].id, orderIndex: activeRoutine.exercises[index - 1].orderIndex } : undefined}
            next={index < activeRoutine.exercises.length - 1 ? { id: activeRoutine.exercises[index + 1].id, orderIndex: activeRoutine.exercises[index + 1].orderIndex } : undefined}
          />
        ))}
      </div>

      {activeRoutine && (addingExercise ? (
        <div className="glass-card p-5"><ExerciseForm routineId={activeRoutine.id} orderIndex={activeRoutine.exercises.length} onDone={() => setAddingExercise(false)} /></div>
      ) : (
        <button type="button" onClick={() => setAddingExercise(true)} className="flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-lg)] text-[12px] font-semibold text-text-secondary" style={{ background: "var(--surface-card)", border: "1px dashed rgba(86,62,58,0.18)" }}><PlusIcon className="h-4 w-4" />운동 추가</button>
      ))}

      <section className="glass-card p-6">
        <p className="mb-2 text-[17px] font-bold text-text-primary">오늘 운동은 어땠나요?</p>
        <p className="mb-5 text-[12px] leading-relaxed text-text-secondary">이 기록은 다음 회차의 중량을 조절하는 기준이 돼요.</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {([['easy', '쉬웠어요'], ['good', '적당했어요'], ['hard', '힘들었어요']] as [WorkoutEffort, string][]).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setEffort(value)} className="min-h-[42px] rounded-full text-[11px] font-semibold" style={effort === value ? { background: "var(--gradient-primary)", color: "var(--color-text-inverse)" } : { background: "var(--surface-card)", color: "var(--color-text-secondary)", border: "var(--border-soft)" }}>{label}</button>
          ))}
        </div>
        <button type="button" onClick={() => setPain((value) => !value)} className="mb-5 flex w-full items-center justify-between rounded-[var(--radius-md)] px-4 py-3 text-[12px] font-semibold" style={pain ? { background: "var(--color-error-soft)", color: "var(--color-error)" } : { background: "var(--surface-card)", color: "var(--color-text-secondary)", border: "var(--border-soft)" }}>
          <span>운동 중 통증이 있었어요</span><span>{pain ? "있음" : "없음"}</span>
        </button>
        <button type="button" onClick={finishWorkout} disabled={!complete || savingCompletion || todayLog?.status === "workout"} className="min-h-[52px] w-full rounded-full text-[14px] font-bold text-text-inverse disabled:cursor-not-allowed disabled:opacity-40" style={{ background: "var(--gradient-primary)", boxShadow: complete ? "var(--shadow-pink)" : "none" }}>
          {savingCompletion ? "저장 중..." : todayLog?.status === "workout" ? "오늘 운동 완료" : complete ? "오늘 운동 완료하기" : `남은 세트 ${totalSets - doneSets}개`}
        </button>
        {completionError && <p className="mt-3 text-[12px] text-error">{completionError}</p>}
      </section>
    </div>
  );
}
