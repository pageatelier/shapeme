"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { BODY_GOAL_PRESETS } from "@/lib/onboarding/types";

export function BodyGoalsStep({
  bodyGoals,
  onChange,
}: {
  bodyGoals: string[];
  onChange: (bodyGoals: string[]) => void;
}) {
  const [customInput, setCustomInput] = useState("");

  function toggle(goal: string) {
    onChange(bodyGoals.includes(goal) ? bodyGoals.filter((g) => g !== goal) : [...bodyGoals, goal]);
  }

  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed || bodyGoals.includes(trimmed)) return;
    onChange([...bodyGoals, trimmed]);
    setCustomInput("");
  }

  // Custom entries are whatever's in bodyGoals but isn't one of the presets.
  const customGoals = bodyGoals.filter((g) => !(BODY_GOAL_PRESETS as readonly string[]).includes(g));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[13px] font-semibold text-text-secondary">How do you want to feel in your body?</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text-primary">
          어떤 몸을 만들어가고 싶나요?
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {BODY_GOAL_PRESETS.map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => toggle(goal)}
            className={`rounded-full px-4 py-2.5 text-[13px] ${
              bodyGoals.includes(goal) ? "pill-selected" : "pill-unselected"
            }`}
          >
            {goal}
          </button>
        ))}
        {customGoals.map((goal) => (
          <button key={goal} type="button" onClick={() => toggle(goal)} className="pill-selected rounded-full px-4 py-2.5 text-[13px]">
            {goal}
          </button>
        ))}
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
          placeholder="직접 입력"
          className="min-h-[44px] flex-1 rounded-full px-4 text-[14px] text-text-primary outline-none"
          style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          aria-label="추가"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary disabled:opacity-40"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
