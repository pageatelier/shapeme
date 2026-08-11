"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { detectBrowserLocaleDefaults } from "@/lib/locale/region";
import { useOnboardingDraft } from "@/lib/onboarding/draft";
import { InspirationStep } from "./steps/InspirationStep";
import { RoutinePreferenceStep } from "./steps/RoutinePreferenceStep";
import { WelcomeStep } from "./steps/WelcomeStep";

const STEP_COUNT = 3; // Welcome, Inspiration, Routine Preference

/**
 * Hosts the guest-first flow's first 3 steps (Phase 4 of the onboarding
 * rewrite) — reachable pre-auth now that the proxy carves out /onboarding
 * (Phase 3). Everything here writes to the localStorage-backed draft, not
 * Supabase, since there's no account yet.
 *
 * This is deliberately where the guest flow currently ends: Path A's
 * existing steps (My Week/My Movement/My Focus/Cautions + Starting Week
 * review) still only run inside the legacy, login-gated OnboardingFlow —
 * rewiring them onto this draft is Phase 5, and Path B's own-routine entry
 * is Phase 6. Choosing a routine preference below just saves the choice;
 * it doesn't yet navigate anywhere past step 2.
 */
export function GuestIntroFlow() {
  const [step, setStep] = useState(0);
  const { draft, patch } = useOnboardingDraft();

  // Same one-time, effect-based prefill OnboardingFlow's step 0 used to do
  // explicitly via LanguageRegionStep — language/region are no longer asked
  // up front, just detected silently and left editable later in Settings.
  useEffect(() => {
    if (draft.language !== "ko" || draft.country !== "KR") return;
    const detected = detectBrowserLocaleDefaults();
    patch(detected);
    // Only run once on mount — this is a one-time prefill, not a live sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue = step === 1 ? draft.inspiration !== null : true;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          aria-label="Back"
          className={`flex h-9 w-9 items-center justify-center rounded-full text-text-secondary ${step === 0 ? "invisible" : ""}`}
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((step + 1) / STEP_COUNT) * 100}%`, background: "var(--gradient-primary)" }}
          />
        </div>
      </div>

      <div className="flex-1">
        {step === 0 && <WelcomeStep />}
        {step === 1 && (
          <InspirationStep value={draft.inspiration} onChange={(inspiration) => patch({ inspiration })} />
        )}
        {step === 2 && (
          <RoutinePreferenceStep
            value={draft.routinePreference}
            onChange={(routinePreference) => patch({ routinePreference })}
          />
        )}
      </div>

      {step === 2 ? (
        draft.routinePreference && (
          <p className="text-center text-[12px] text-text-muted">Saved — we&apos;ll pick this up next.</p>
        )
      ) : (
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1))}
          disabled={!canContinue}
          className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          {step === 0 ? "Get started" : "Continue"}
        </button>
      )}
    </div>
  );
}
