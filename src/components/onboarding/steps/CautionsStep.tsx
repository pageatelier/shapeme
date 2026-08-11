"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { OnboardingPhotoHero } from "@/components/onboarding/OnboardingPhotoHero";
import { CAUTION_PRESETS } from "@/lib/onboarding/types";
import type { CautionArea } from "@/lib/onboarding/types";

const NONE = "None";
const PRESET_VALUES: readonly string[] = CAUTION_PRESETS.map((p) => p.value);

export function CautionsStep({
  cautions,
  avoidedExercisesNote,
  onChange,
}: {
  cautions: (CautionArea | string)[];
  avoidedExercisesNote: string;
  onChange: (patch: { cautions?: (CautionArea | string)[]; avoidedExercisesNote?: string }) => void;
}) {
  const [customInput, setCustomInput] = useState("");
  const isNone = cautions.length === 1 && cautions[0] === NONE;

  function toggle(value: CautionArea | string) {
    if (cautions.includes(value)) {
      onChange({ cautions: cautions.filter((c) => c !== value) });
    } else {
      // Selecting a specific caution un-selects "없음", and vice versa —
      // "no cautions" doesn't coexist with an actual one.
      onChange({ cautions: value === NONE ? [NONE] : [...cautions.filter((c) => c !== NONE), value] });
    }
  }

  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed || cautions.includes(trimmed)) return;
    onChange({ cautions: [...cautions.filter((c) => c !== NONE), trimmed] });
    setCustomInput("");
  }

  const customCautions = cautions.filter((c) => c !== NONE && !PRESET_VALUES.includes(c));

  return (
    <div className="flex flex-col gap-6">
      <OnboardingPhotoHero
        src="/onboading-images/comfort.webp"
        eyebrow="Is there anything we should take care of?"
        title="Any areas we should be gentle with?"
        objectPosition="center 25%"
      />

      <div className="flex flex-wrap gap-2">
        {CAUTION_PRESETS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={`rounded-full px-4 py-2.5 text-[13px] ${
              cautions.includes(value) ? "pill-selected" : "pill-unselected"
            }`}
          >
            {label}
          </button>
        ))}
        {customCautions.map((c) => (
          <button key={c} type="button" onClick={() => toggle(c)} className="pill-selected rounded-full px-4 py-2.5 text-[13px]">
            {c}
          </button>
        ))}
        <button
          type="button"
          onClick={() => toggle(NONE)}
          className={`rounded-full px-4 py-2.5 text-[13px] ${isNone ? "pill-selected" : "pill-unselected"}`}
        >
          {NONE}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Other (type your own)"
          className="min-h-[44px] flex-1 rounded-full px-4 text-[14px] text-text-primary outline-none"
          style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          aria-label="Add"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary disabled:opacity-40"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">Any exercises you&apos;d rather avoid? (optional)</p>
        <input
          type="text"
          value={avoidedExercisesNote}
          onChange={(e) => onChange({ avoidedExercisesNote: e.target.value })}
          placeholder="e.g. squats"
          className="min-h-[44px] w-full rounded-[var(--radius-md)] px-4 text-[14px] text-text-primary outline-none"
          style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
        />
      </div>
    </div>
  );
}
