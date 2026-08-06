"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronDownIcon, PlusIcon } from "@/components/icons";
import { deleteRoutine } from "@/lib/workout/mutations";
import type { WorkoutRoutine } from "@/lib/workout/types";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseForm } from "./ExerciseForm";
import { RoutineForm } from "./RoutineForm";

function routineLabel(routine: WorkoutRoutine) {
  return routine.days.length > 0 ? `${routine.days.join("·")} · ${routine.name}` : routine.name;
}

/** Full routine management — create/rename/day-assignment/delete a routine,
 * plus browse and edit the exercises inside it (add/edit/reorder/delete),
 * same as Move's daily view used to show before it was narrowed to just
 * today's routines. One routine expands at a time (accordion) so a long
 * routine list doesn't turn into a wall of exercise cards. */
export function RoutineManager({ routines, date }: { routines: WorkoutRoutine[]; date: string }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [addingExerciseFor, setAddingExerciseFor] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ExerciseCard reports set toggles up so Move's daily view can update its
  // live % without a refresh — this view doesn't show any aggregate, so the
  // callback has nothing to do, but ExerciseCard still needs one to call.
  const noopSetsChange = useCallback(() => {}, []);

  async function handleDeleteRoutine(routineId: string) {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteRoutine(routineId);
      setConfirmDeleteId(null);
      setExpandedId(null);
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "삭제에 실패했어요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {routines.map((routine) => {
        const expanded = expandedId === routine.id;
        return (
          <div key={routine.id} className="surface-card overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : routine.id)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-[14px] font-semibold text-text-primary">{routineLabel(routine)}</span>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 shrink-0 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            {expanded && (
              <div
                className="flex flex-col gap-3 border-t px-4 py-4"
                style={{ borderColor: "rgba(78, 59, 54, 0.07)" }}
              >
                {editingRoutineId === routine.id ? (
                  <RoutineForm
                    orderIndex={routine.orderIndex}
                    routine={routine}
                    onDone={() => setEditingRoutineId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRoutineId(routine.id)}
                      className="text-[12px] font-semibold text-pink-500"
                    >
                      루틴 이름 · 요일 수정
                    </button>
                    {confirmDeleteId !== routine.id && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(routine.id)}
                        className="text-[12px] font-semibold text-text-muted"
                      >
                        루틴 삭제
                      </button>
                    )}
                  </div>
                )}

                {confirmDeleteId === routine.id && (
                  <div
                    className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] p-2.5"
                    style={{ background: "var(--color-error-soft)" }}
                  >
                    <span className="text-[11px] text-text-secondary">
                      {deleteError ?? "이 루틴과 안의 운동을 모두 삭제할까요?"}
                    </span>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteRoutine(routine.id)}
                        disabled={deleting}
                        className="rounded-full px-3 py-1 text-[11px] font-bold text-text-inverse disabled:opacity-60"
                        style={{ background: "var(--color-error)" }}
                      >
                        삭제
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteId(null);
                          setDeleteError(null);
                        }}
                        disabled={deleting}
                        className="rounded-full px-3 py-1 text-[11px] font-semibold text-text-secondary"
                        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {routine.exercises.map((exercise, i) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      date={date}
                      orderIndex={i}
                      editMode
                      onSetsChange={noopSetsChange}
                      prevId={i > 0 ? routine.exercises[i - 1].id : undefined}
                      prevOrderIndex={i > 0 ? routine.exercises[i - 1].orderIndex : undefined}
                      nextId={i < routine.exercises.length - 1 ? routine.exercises[i + 1].id : undefined}
                      nextOrderIndex={
                        i < routine.exercises.length - 1 ? routine.exercises[i + 1].orderIndex : undefined
                      }
                    />
                  ))}
                  {routine.exercises.length === 0 && addingExerciseFor !== routine.id && (
                    <p className="text-center text-[12px] text-text-muted">아직 등록된 운동이 없어요.</p>
                  )}
                </div>

                {addingExerciseFor === routine.id ? (
                  <ExerciseForm
                    routineId={routine.id}
                    orderIndex={routine.exercises.length}
                    onDone={() => setAddingExerciseFor(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingExerciseFor(routine.id)}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-lg)] text-[12px] font-semibold text-text-secondary"
                    style={{ background: "var(--color-peach-100)", border: "1px dashed rgba(78, 59, 54, 0.12)" }}
                  >
                    <PlusIcon className="h-3.5 w-3.5" />이 루틴에 운동 추가
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {routines.length === 0 && !adding && (
        <p className="surface-card p-4 text-center text-[13px] text-text-muted">아직 만든 루틴이 없어요.</p>
      )}

      {adding ? (
        <RoutineForm orderIndex={routines.length} onDone={() => setAdding(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-lg)] text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--color-peach-100)", border: "1px dashed rgba(78, 59, 54, 0.12)" }}
        >
          <PlusIcon className="h-4 w-4" />
          새 루틴 만들기
        </button>
      )}
    </div>
  );
}
