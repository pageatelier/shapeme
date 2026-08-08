"use client";

import { FOCUS_AREA_OPTIONS, MAX_FOCUS_AREAS } from "@/lib/onboarding/types";
import type { FocusArea } from "@/lib/onboarding/types";

export function FocusAreaStep({
  focusAreas,
  onChange,
}: {
  focusAreas: FocusArea[];
  onChange: (focusAreas: FocusArea[]) => void;
}) {
  const atCap = focusAreas.length >= MAX_FOCUS_AREAS;

  function toggle(area: FocusArea) {
    if (focusAreas.includes(area)) {
      onChange(focusAreas.filter((a) => a !== area));
    } else if (!atCap) {
      onChange([...focusAreas, area]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[13px] font-semibold text-text-secondary">Where would you like to focus?</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text-primary">
          어디에 조금 더 집중하고 싶나요?
        </h1>
        <p className="mt-1.5 text-[12px] text-text-muted">최대 {MAX_FOCUS_AREAS}개까지 선택할 수 있어요.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FOCUS_AREA_OPTIONS.map(({ value, label }) => {
          const selected = focusAreas.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              disabled={!selected && atCap}
              className={`rounded-full px-4 py-2.5 text-[13px] disabled:opacity-40 ${
                selected ? "pill-selected" : "pill-unselected"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
