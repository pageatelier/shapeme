"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { generateWeeklyRoutineAction } from "@/lib/aiRoutine/actions";
import { saveWeeklyRoutineToMove } from "@/lib/aiRoutine/saveWeeklyRoutine";
import type { AIRoutineWeek } from "@/lib/aiRoutine/types";
import { detectBrowserLocaleDefaults } from "@/lib/locale/region";
import { saveOnboardingProfile } from "@/lib/onboarding/mutations";
import { cautionLabel } from "@/lib/onboarding/types";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { StartingWeekReview } from "./StartingWeekReview";
import { BodyGoalsStep } from "./steps/BodyGoalsStep";
import { CautionsStep } from "./steps/CautionsStep";
import { FocusAreaStep } from "./steps/FocusAreaStep";
import { LanguageRegionStep } from "./steps/LanguageRegionStep";
import { WorkoutLogisticsStep } from "./steps/WorkoutLogisticsStep";

const STEP_COUNT = 5;

function canContinue(step: number, profile: OnboardingProfile): boolean {
  switch (step) {
    case 0:
      return true; // language/region always default to something
    case 1:
      return profile.bodyGoals.length > 0;
    case 2:
      return profile.focusAreas.length > 0;
    case 3:
      return profile.workoutDays.length > 0 && profile.place !== null && profile.minutesPerSession !== null && profile.experience !== null;
    case 4:
      return true; // cautions are optional ("없음" is a real answer, not a skip)
    default:
      return false;
  }
}

type Phase = "steps" | "review";

/**
 * Steps ②–⑥ collect the profile, then ⑦ calls the real weekday-based AI
 * generator (src/lib/aiRoutine/) — same service Guide uses — and ⑧–⑨ is
 * the review with Start my week. Saves the profile once on step ⑥'s
 * Continue (not per-step, so leaving mid-flow doesn't half-write metadata);
 * onboardingCompleted only flips true once the week is actually saved to
 * Move in ⑨, since that's the real "finished onboarding" moment.
 */
export function OnboardingFlow({ initialProfile }: { initialProfile: OnboardingProfile }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("steps");
  const [week, setWeek] = useState<AIRoutineWeek | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Prefills language/region from the browser the first time this mounts,
  // but only if the user hasn't already saved a real answer before (e.g.
  // returning to this page after step 1). Deliberately an effect, not a
  // useState initializer: navigator.language isn't available during SSR, so
  // computing it there would render ko/KR on the server and a different
  // value on the client, causing a hydration mismatch. Applying it after
  // mount instead means the selects briefly show ko/KR then update once —
  // the standard trade-off for reading browser-only APIs safely.
  useEffect(() => {
    if (initialProfile.language !== "ko" || initialProfile.country !== "KR") return;
    const detected = detectBrowserLocaleDefaults();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setProfile((prev) => ({ ...prev, ...detected }));
    // Only run once on mount — this is a one-time prefill, not a live sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patch(p: Partial<OnboardingProfile>) {
    setProfile((prev) => ({ ...prev, ...p }));
  }

  async function handleContinue() {
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (profile.workoutDays.length === 0 || !profile.place || !profile.minutesPerSession || !profile.experience) {
      return; // canContinue already guards this; narrows types for the call below
    }
    setSaving(true);
    setError(null);
    try {
      await saveOnboardingProfile(profile);
      const result = await generateWeeklyRoutineAction({
        workoutDays: profile.workoutDays,
        sessionMinutes: profile.minutesPerSession,
        place: profile.place,
        goals: profile.bodyGoals,
        focusAreas: profile.focusAreas,
        avoidAreas: [
          ...profile.cautions.map(cautionLabel),
          ...(profile.avoidedExercisesNote.trim() ? [profile.avoidedExercisesNote.trim()] : []),
        ],
        experience: profile.experience,
        equipment: profile.equipment,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setWeek(result.week);
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStart() {
    if (!week) return;
    setStarting(true);
    setStartError(null);
    try {
      await saveWeeklyRoutineToMove(week);
      await saveOnboardingProfile({ onboardingCompleted: true });
      router.push("/move");
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setStarting(false);
    }
  }

  if (phase === "review" && week) {
    return <StartingWeekReview week={week} onStart={handleStart} starting={starting} error={startError} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          aria-label="이전"
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
        {step === 0 && (
          <LanguageRegionStep
            language={profile.language}
            country={profile.country}
            onChange={patch}
          />
        )}
        {step === 1 && <BodyGoalsStep bodyGoals={profile.bodyGoals} onChange={(bodyGoals) => patch({ bodyGoals })} />}
        {step === 2 && (
          <FocusAreaStep focusAreas={profile.focusAreas} onChange={(focusAreas) => patch({ focusAreas })} />
        )}
        {step === 3 && (
          <WorkoutLogisticsStep
            workoutDays={profile.workoutDays}
            place={profile.place}
            minutesPerSession={profile.minutesPerSession}
            experience={profile.experience}
            equipment={profile.equipment}
            onChange={patch}
          />
        )}
        {step === 4 && (
          <CautionsStep
            cautions={profile.cautions}
            avoidedExercisesNote={profile.avoidedExercisesNote}
            onChange={patch}
          />
        )}
      </div>

      {error && <p className="text-center text-[12px] text-error">{error}</p>}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue(step, profile) || saving}
        className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
      >
        {saving ? (step === STEP_COUNT - 1 ? "루틴 만드는 중..." : "저장 중...") : "Continue"}
      </button>
    </div>
  );
}
