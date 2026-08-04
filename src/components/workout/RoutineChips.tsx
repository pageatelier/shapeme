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
      <div className="relative -mx-5 px-5">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pr-6">
          {routines.map((routine) => {
            const active = routine.id === activeId;
            return (
              <button
                key={routine.id}
                type="button"
                onClick={() => onSelect(routine.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap ${active ? "pill-selected" : "pill-unselected"}`}
                // Softer than pill-selected's own border/shadow — scoped here
                // via inline style so the shared class (used all over the
                // app) stays untouched.
                style={active ? { border: "1px solid rgba(217, 126, 148, 0.3)", boxShadow: "0 2px 6px rgba(217, 126, 148, 0.14)" } : undefined}
              >
                {routine.days.length > 0 ? `${routine.days.join("·")} · ${routine.name}` : routine.name}
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
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{ background: "linear-gradient(to right, transparent, var(--color-bg))" }}
        />
      </div>

      {adding && (
        <RoutineForm orderIndex={routines.length} onDone={() => setAdding(false)} />
      )}
    </div>
  );
}
