"use client";

import { useState } from "react";
import { SetDots } from "@/components/SetDots";
import { EditIcon } from "@/components/icons";
import { saveSetLog } from "@/lib/workout/mutations";
import type { WorkoutExercise } from "@/lib/workout/types";
import { ExerciseForm } from "./ExerciseForm";

export function ExerciseCard({
  exercise,
  date,
  orderIndex,
}: {
  exercise: WorkoutExercise;
  date: string;
  orderIndex: number;
}) {
  const [sets, setSets] = useState(exercise.sets);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const done = sets.filter(Boolean).length;
  const complete = done === exercise.targetSets && exercise.targetSets > 0;

  async function toggleSet(index: number) {
    const next = sets.map((v, i) => (i === index ? !v : v));
    setSets(next);
    setSaveError(null);
    try {
      await saveSetLog({ exerciseId: exercise.id, date, sets: next });
    } catch (err) {
      setSets(sets);
      setSaveError(err instanceof Error ? err.message : "저장에 실패했어요.");
    }
  }

  if (editing) {
    return (
      <div className="glass-card p-5">
        <ExerciseForm
          routineId={exercise.routineId}
          orderIndex={orderIndex}
          exercise={exercise}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[15px] font-bold tracking-[-0.02em] text-text-primary">
            {exercise.name}
          </p>
          <p className="font-en text-[13px] text-text-muted">
            {exercise.targetReps}회 × {exercise.targetSets}세트
            {exercise.weightKg ? ` · ${exercise.weightKg}kg` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={
              complete
                ? { background: "var(--color-success-soft)", color: "var(--color-success)" }
                : { background: "var(--surface-card)", color: "var(--color-text-muted)" }
            }
          >
            {complete ? "완료" : `${done}/${exercise.targetSets}`}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="운동 편집"
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted"
          >
            <EditIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <SetDots sets={sets} onToggle={toggleSet} size={28} />
      {exercise.memo && <p className="mt-3 text-xs text-text-muted">메모 · {exercise.memo}</p>}
      {saveError && <p className="mt-2 text-xs text-error">{saveError}</p>}
    </div>
  );
}
