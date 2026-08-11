"use client";

import { OnboardingPhotoHero } from "@/components/onboarding/OnboardingPhotoHero";
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
      <OnboardingPhotoHero
        src="/onboading-images/focus-area.webp"
        eyebrow="Where would you like to focus?"
        title="Where would you like to feel the most change?"
        subtitle={`Choose up to ${MAX_FOCUS_AREAS}.`}
      />

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
