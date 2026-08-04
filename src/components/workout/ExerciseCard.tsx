"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { SetDots } from "@/components/SetDots";
import { ChevronDownIcon, ChevronUpIcon, EditIcon } from "@/components/icons";
import { saveSetLog, swapExerciseOrder } from "@/lib/workout/mutations";
import type { WorkoutExercise } from "@/lib/workout/types";
import { ExerciseForm } from "./ExerciseForm";

function ExerciseCardImpl({
  exercise,
  date,
  orderIndex,
  prevId,
  prevOrderIndex,
  nextId,
  nextOrderIndex,
  editMode = false,
  onSetsChange,
}: {
  exercise: WorkoutExercise;
  date: string;
  orderIndex: number;
  // Flat primitive props instead of a `{id, orderIndex}` neighbor object —
  // WorkoutView.map() would otherwise build a fresh object every render,
  // which defeats this component's React.memo below regardless of whether
  // the neighbor actually changed.
  prevId?: string;
  prevOrderIndex?: number;
  nextId?: string;
  nextOrderIndex?: number;
  editMode?: boolean;
  onSetsChange?: (exerciseId: string, sets: boolean[]) => void;
}) {
  const router = useRouter();
  const [sets, setSets] = useState(exercise.sets);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [reordering, setReordering] = useState(false);

  const done = sets.filter(Boolean).length;
  const complete = done === exercise.targetSets && exercise.targetSets > 0;

  async function toggleSet(index: number) {
    const next = sets.map((v, i) => (i === index ? !v : v));
    setSets(next);
    onSetsChange?.(exercise.id, next);
    setSaveError(null);
    try {
      await saveSetLog({ exerciseId: exercise.id, date, sets: next });
    } catch (err) {
      setSets(sets);
      onSetsChange?.(exercise.id, sets);
      setSaveError(err instanceof Error ? err.message : "저장에 실패했어요.");
    }
  }

  async function move(targetId: string | undefined, targetOrderIndex: number | undefined) {
    if (!targetId || targetOrderIndex === undefined || reordering) return;
    setReordering(true);
    setSaveError(null);
    try {
      await swapExerciseOrder(
        { id: exercise.id, orderIndex: exercise.orderIndex },
        { id: targetId, orderIndex: targetOrderIndex },
      );
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "순서 변경에 실패했어요.");
    } finally {
      setReordering(false);
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
    <div className="glass-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[14px] font-bold tracking-[-0.02em] text-text-primary">
          {exercise.name}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={
              complete
                ? { background: "var(--color-success-soft)", color: "var(--color-success)" }
                : { background: "var(--surface-card)", color: "var(--color-text-muted)" }
            }
          >
            {complete ? "완료" : `${done}/${exercise.targetSets}`}
          </span>
          {editMode && (
            <>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(prevId, prevOrderIndex)}
                  disabled={!prevId || reordering}
                  aria-label="위로 이동"
                  className="flex h-4 w-6 items-center justify-center text-text-muted disabled:opacity-30"
                >
                  <ChevronUpIcon className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(nextId, nextOrderIndex)}
                  disabled={!nextId || reordering}
                  aria-label="아래로 이동"
                  className="flex h-4 w-6 items-center justify-center text-text-muted disabled:opacity-30"
                >
                  <ChevronDownIcon className="h-3 w-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="운동 편집"
                className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted"
              >
                <EditIcon className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <p className="font-en mt-0.5 text-[12px] font-medium text-text-secondary">
        {exercise.targetReps}회{exercise.weightKg ? ` · ${exercise.weightKg}kg` : ""}
      </p>
      {exercise.memo && <p className="mt-1 text-[11px] text-text-muted">메모 · {exercise.memo}</p>}

      <div className="mt-2 flex justify-end">
        <SetDots sets={sets} onToggle={toggleSet} size={34} />
      </div>
      {saveError && <p className="mt-2 text-xs text-error">{saveError}</p>}
    </div>
  );
}

// Toggling one set re-renders WorkoutView (for the top progress %), which
// would otherwise re-render every sibling ExerciseCard too — memoized so a
// tap on one exercise doesn't re-render the others in the same routine.
export const ExerciseCard = memo(ExerciseCardImpl);
