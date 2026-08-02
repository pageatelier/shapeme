"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import type { WorkoutRoutine } from "@/lib/workout/types";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseForm } from "./ExerciseForm";
import { RoutineChips } from "./RoutineChips";
import { RoutineForm } from "./RoutineForm";

/**
 * The default, no-program workout view: freely create/edit/delete routines
 * and exercises, check off sets. No Day-N/phase framing, no effort/pain
 * logging, no "finish workout" step — this is the plain, ongoing
 * self-management experience. Rendered by (main)/workout/page.tsx when the
 * user has no active 100-day challenge; the 100-day program (WorkoutView)
 * stays available as an opt-in from here or from My.
 */
export function GeneralWorkoutView({ routines, date }: { routines: WorkoutRoutine[]; date: string }) {
  const [activeId, setActiveId] = useState<string | null>(routines[0]?.id ?? null);
  const [addingExercise, setAddingExercise] = useState(false);

  const activeRoutine = routines.find((routine) => routine.id === activeId) ?? routines[0] ?? null;

  if (routines.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">운동</h1>
        <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-[15px] font-bold text-text-primary">아직 운동 루틴이 없어요</p>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            요일별 루틴을 만들고 운동을 추가해보세요.
          </p>
        </div>
        <RoutineForm orderIndex={0} onDone={() => {}} />
        <ChallengeEntryPoint />
      </div>
    );
  }

  const totalSets = activeRoutine?.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0) ?? 0;
  const doneSets =
    activeRoutine?.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(Boolean).length, 0) ?? 0;
  const progress = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">운동</h1>

      <div className="glass-card flex items-center justify-between p-5">
        <div>
          <p className="font-en mb-1 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
            routine progress
          </p>
          <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">
            {doneSets} / {totalSets}세트 완료
          </p>
        </div>
        <div className="font-en text-3xl font-semibold tracking-[-0.05em] text-text-primary">
          {progress}
          <span className="text-sm text-text-muted">%</span>
        </div>
      </div>

      <RoutineChips routines={routines} activeId={activeRoutine?.id ?? null} onSelect={setActiveId} />

      <div className="flex flex-col gap-3">
        {activeRoutine?.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            date={date}
            orderIndex={index}
            prev={
              index > 0
                ? { id: activeRoutine.exercises[index - 1].id, orderIndex: activeRoutine.exercises[index - 1].orderIndex }
                : undefined
            }
            next={
              index < activeRoutine.exercises.length - 1
                ? { id: activeRoutine.exercises[index + 1].id, orderIndex: activeRoutine.exercises[index + 1].orderIndex }
                : undefined
            }
          />
        ))}
        {activeRoutine?.exercises.length === 0 && (
          <p className="surface-card p-4 text-center text-[13px] text-text-muted">
            이 루틴에 운동을 추가해보세요.
          </p>
        )}
      </div>

      {activeRoutine &&
        (addingExercise ? (
          <div className="glass-card p-5">
            <ExerciseForm
              routineId={activeRoutine.id}
              orderIndex={activeRoutine.exercises.length}
              onDone={() => setAddingExercise(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingExercise(true)}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--radius-lg)] text-[13px] font-semibold text-text-secondary"
            style={{ background: "var(--surface-card)", border: "1px dashed rgba(86, 62, 58, 0.2)" }}
          >
            <PlusIcon className="h-4 w-4" />
            운동 추가
          </button>
        ))}

      <ChallengeEntryPoint />
    </div>
  );
}

function ChallengeEntryPoint() {
  return (
    <div className="glass-card p-5 text-center">
      <p className="mb-2 text-[13px] font-bold text-text-primary">더 체계적인 프로그램이 필요하신가요?</p>
      <p className="mb-3 text-[12px] leading-relaxed text-text-secondary">
        목표에 맞춘 100일 고정 프로그램을 만들어드려요. 언제든 시작할 수 있어요.
      </p>
      <Link href="/start" className="text-[12px] font-semibold text-pink-500">
        100일 챌린지 시작하기
      </Link>
    </div>
  );
}
