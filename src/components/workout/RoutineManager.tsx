"use client";

import { useState } from "react";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import type { WorkoutRoutine } from "@/lib/workout/types";
import { RoutineForm } from "./RoutineForm";

function routineLabel(routine: WorkoutRoutine) {
  return routine.days.length > 0 ? `${routine.days.join("·")} · ${routine.name}` : routine.name;
}

/** Full CRUD list for routines — create/rename/day-assignment/delete, all
 * via RoutineForm (routine passed = edit, omitted = create). Lives on its
 * own settings page now instead of Move's daily view, since browsing/editing
 * every routine isn't a daily-use action. */
export function RoutineManager({ routines }: { routines: WorkoutRoutine[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {routines.map((routine) =>
        editingId === routine.id ? (
          <RoutineForm
            key={routine.id}
            orderIndex={routine.orderIndex}
            routine={routine}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <button
            key={routine.id}
            type="button"
            onClick={() => setEditingId(routine.id)}
            className="surface-card flex items-center justify-between px-4 py-3.5 text-left"
          >
            <span className="text-[14px] font-semibold text-text-primary">{routineLabel(routine)}</span>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          </button>
        ),
      )}

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
          style={{ background: "var(--color-peach-100)", border: "1px dashed rgba(86, 62, 58, 0.12)" }}
        >
          <PlusIcon className="h-4 w-4" />
          새 루틴 만들기
        </button>
      )}
    </div>
  );
}
