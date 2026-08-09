"use client";

import { ACTIVITY_CONFIG, ACTIVITY_TYPES } from "@/lib/movement/types";
import type { MovementActivityType } from "@/lib/movement/types";

/** Shown when "+ 오늘의 움직임 추가" is tapped — strength isn't one of the
 * choices here since it's already always visible above (routine/exercise/set
 * UI), with no separate "log" step; picking a type here always means one of
 * the simple (non-set-based) movement logs. */
export function ActivityTypePicker({ onSelect }: { onSelect: (type: MovementActivityType) => void }) {
  return (
    <div className="glass-card p-5">
      <p className="mb-3 text-[13px] font-bold text-text-primary">어떤 움직임인가요?</p>
      <div className="grid grid-cols-3 gap-2">
        {ACTIVITY_TYPES.map((type) => {
          const { label } = ACTIVITY_CONFIG[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className="pill-unselected flex flex-col items-center gap-1 rounded-[var(--radius-md)] py-3 text-[12px] font-semibold"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
