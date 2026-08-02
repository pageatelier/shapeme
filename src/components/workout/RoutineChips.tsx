"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import type { WorkoutRoutine } from "@/lib/workout/types";
import { RoutineForm } from "./RoutineForm";

export function RoutineChips({
  routines,
  activeId,
  onSelect,
}: {
  routines: WorkoutRoutine[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
        {routines.map((routine) => {
          const active = routine.id === activeId;
          return (
            <button
              key={routine.id}
              type="button"
              onClick={() => onSelect(routine.id)}
              className="shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap"
              style={
                active
                  ? { background: "var(--gradient-primary)", color: "var(--color-text-inverse)", boxShadow: "var(--shadow-pink)" }
                  : { background: "var(--surface-card)", color: "var(--color-text-secondary)", border: "var(--border-soft)" }
              }
            >
              {routine.name}
              {routine.days.length > 0 && (
                <span className="font-en ml-1.5 text-[11px] opacity-80">{routine.days.join("·")}</span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-label="루틴 추가"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <PlusIcon className="h-4 w-4 text-text-secondary" />
        </button>
      </div>

      {adding && (
        <RoutineForm orderIndex={routines.length} onDone={() => setAdding(false)} />
      )}
    </div>
  );
}
