"use client";

import { useMemo, useState } from "react";
import { EditIcon, PlusIcon } from "@/components/icons";
import { weekdayIndex } from "@/lib/body/date";
import { WEEKDAYS } from "@/lib/workout/types";
import type { WorkoutRoutine } from "@/lib/workout/types";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseForm } from "./ExerciseForm";
import { RoutineChips } from "./RoutineChips";
import { RoutineForm } from "./RoutineForm";

function todayWeekdayLabel(date: string) {
  return WEEKDAYS[weekdayIndex(date)];
}

export function WorkoutView({ routines, date }: { routines: WorkoutRoutine[]; date: string }) {
  const todayLabel = todayWeekdayLabel(date);
  const defaultRoutineId = useMemo(() => {
    const todays = routines.find((r) => r.days.includes(todayLabel));
    return (todays ?? routines[0])?.id ?? null;
  }, [routines, todayLabel]);

  const [activeId, setActiveId] = useState<string | null>(defaultRoutineId);
  const [editingRoutine, setEditingRoutine] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [exerciseEditMode, setExerciseEditMode] = useState(false);

  const activeRoutine = routines.find((r) => r.id === activeId) ?? routines[0] ?? null;

  if (routines.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Move</h1>
        </div>
        <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-[15px] font-bold text-text-primary">아직 운동 루틴이 없어요</p>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            요일별 루틴을 만들고 운동을 추가해보세요.
          </p>
        </div>
        <RoutineForm orderIndex={0} onDone={() => {}} />
      </div>
    );
  }

  const totalSets = activeRoutine?.exercises.reduce((sum, e) => sum + e.targetSets, 0) ?? 0;
  const doneSets =
    activeRoutine?.exercises.reduce((sum, e) => sum + e.sets.filter(Boolean).length, 0) ?? 0;
  const progress = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-en mb-1.5 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
          {date} · {todayLabel}요일
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Move</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExerciseEditMode((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${exerciseEditMode ? "pill-selected" : "pill-unselected"}`}
            >
              편집
            </button>
            <button
              type="button"
              onClick={() => setEditingRoutine((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary"
              style={{ background: "rgba(255,255,255,0.72)", border: "var(--border-soft)" }}
              aria-label="루틴 편집"
            >
              <EditIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {editingRoutine && activeRoutine && (
        <RoutineForm
          orderIndex={activeRoutine.orderIndex}
          routine={activeRoutine}
          onDone={() => setEditingRoutine(false)}
        />
      )}

      <div className="glass-card flex items-center justify-between p-5">
        <div>
          <p className="font-en mb-1 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
            routine progress
          </p>
          <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">
            {doneSets} / {totalSets}세트 완료
          </p>
        </div>
        <div className="font-en flex items-baseline text-text-primary">
          <span className="text-3xl font-semibold tracking-[-0.05em]">{progress}</span>
          <span className="text-sm text-text-muted">%</span>
        </div>
      </div>

      <RoutineChips routines={routines} activeId={activeRoutine?.id ?? null} onSelect={setActiveId} />

      <div className="flex flex-col gap-3">
        {activeRoutine?.exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            date={date}
            orderIndex={i}
            editMode={exerciseEditMode}
            prev={
              i > 0
                ? { id: activeRoutine.exercises[i - 1].id, orderIndex: activeRoutine.exercises[i - 1].orderIndex }
                : undefined
            }
            next={
              i < activeRoutine.exercises.length - 1
                ? { id: activeRoutine.exercises[i + 1].id, orderIndex: activeRoutine.exercises[i + 1].orderIndex }
                : undefined
            }
          />
        ))}
        {activeRoutine?.exercises.length === 0 && !addingExercise && (
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
            style={{ background: "var(--color-peach-100)", border: "1px dashed rgba(86, 62, 58, 0.12)" }}
          >
            <PlusIcon className="h-4 w-4" />
            운동 추가
          </button>
        ))}
    </div>
  );
}
