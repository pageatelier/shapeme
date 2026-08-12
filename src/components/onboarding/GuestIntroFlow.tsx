"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BodyCapture } from "@/components/body/BodyCapture";
import { CheckIcon, ChevronLeftIcon } from "@/components/icons";
import { OnboardingBannerImage } from "@/components/onboarding/OnboardingBannerImage";
import { detectBrowserLocaleDefaults } from "@/lib/locale/region";
import { useOnboardingDraft } from "@/lib/onboarding/draft";
import type { OnboardingDraft, OnboardingStage } from "@/lib/onboarding/draft";
import { generateStartingWeek } from "@/lib/onboarding/generateStartingWeek";
import type { StartingWeekDay } from "@/lib/onboarding/generateStartingWeek";
import { saveOnboardingProfile } from "@/lib/onboarding/mutations";
import { saveStartingWeekToMove } from "@/lib/onboarding/saveStartingWeek";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { createClient } from "@/lib/supabase/client";
import { updateSettings } from "@/lib/settings/mutations";
import { StartingWeekReview } from "./StartingWeekReview";
import { AccountCreationStep } from "./steps/AccountCreationStep";
import { CautionsStep } from "./steps/CautionsStep";
import { DailyCareStep } from "./steps/DailyCareStep";
import { EquipmentStep } from "./steps/EquipmentStep";
import { FocusAreaStep } from "./steps/FocusAreaStep";
import { InspirationStep } from "./steps/InspirationStep";
import { MyWeekStep } from "./steps/MyWeekStep";
import { RoutinePreferenceStep } from "./steps/RoutinePreferenceStep";
import { WelcomeStep } from "./steps/WelcomeStep";

// Welcome, Inspiration, Routine Preference — Path B ("I have my own
// routine") has nowhere further to go until Phase 6 exists, so this is the
// step count until create_for_me is chosen.
const INTRO_STEP_COUNT = 3;
// + My Focus (FocusArea), My Week (days/duration/experience), Equipment,
// Cautions — Path A's own steps, pointed at patchDraft() instead of
// saveOnboardingProfile(). Equipment is its own step (split out of what
// used to be a combined WorkoutLogisticsStep) so My Week doesn't ask too
// many questions at once. There's no separate body-goals step: Inspiration
// (step 1) already collects an equivalent visual signal, and
// generateStartingWeek() never reads bodyGoals anyway (unlike focusAreas,
// which drives the weekly split). Last step's Continue generates the week
// and moves to review.
const PATH_A_STEP_COUNT = 7;

// Draft stages with an unfinished tail worth resuming — see OnboardingStage's
// doc comment in draft.ts for what each one means.
const RESUMABLE_STAGES: OnboardingStage[] = ["routine_ready", "awaiting_auth", "daily_care", "body_check_in"];

function canContinueForStep(step: number, draft: OnboardingDraft): boolean {
  switch (step) {
    case 0:
      return true;
    case 1:
      return draft.inspiration !== null;
    case 2:
      return draft.routinePreference === "create_for_me";
    case 3:
      return draft.focusAreas.length > 0;
    case 4:
      return draft.workoutDays.length > 0 && draft.minutesPerSession !== null && draft.experience !== null;
    case 5:
      return true; // equipment is optional
    case 6:
      return true; // cautions are optional
    default:
      return false;
  }
}

type Phase = "steps" | "review" | "account" | "dailyCare" | "bodyCheckIn" | "complete";

/**
 * Hosts the guest-first flow — reachable pre-auth now that the proxy
 * carves out /onboarding (Phase 3). Everything through Starting Week
 * review writes to the localStorage-backed draft, not Supabase, since
 * there's no account yet.
 *
 * Steps 0–2 (Welcome/Inspiration/Routine Preference) always run for a
 * fresh guest. "I have my own routine" is disabled until Path B (type/paste
 * + photo import) ships. "Create a routine for me" continues into Path A's
 * own steps (My Focus/My Movement/Cautions — see PATH_A_STEP_COUNT's
 * comment for why there's no separate body-goals step), pointed at
 * patchDraft() instead of saveOnboardingProfile(), through to Starting
 * Week review.
 *
 * From there, Account Creation is the first moment anything touches
 * Supabase — on success the whole draft (profile fields + the generated
 * week) gets bulk-written. Daily Care and Body Check-In run post-auth. Body
 * photos specifically are never touchable before this point: BodyCapture
 * only renders in the "bodyCheckIn" phase, which is only reachable after a
 * session exists. Finishing Body Check-In finalizes (onboardingCompleted:
 * true + programStartedAt), clears the draft, and shows a "complete" screen
 * before the user chooses to head to Today themselves — landing straight on
 * Today with no acknowledgment read as an abrupt, unfinished-feeling drop.
 *
 * `draft.stage` — not this component's own `phase` state — is what a
 * fresh mount actually resumes from, because `phase` doesn't survive a
 * reload/new-tab/redirect and `stage` does (see OnboardingStage). Three
 * entry points all funnel through the same resume logic below: a guest
 * closing the tab mid-Account-Creation and reopening /onboarding, the
 * Supabase email-confirmation link redirecting back to /onboarding once
 * confirmed (AccountCreationStep's emailRedirectTo), and a plain login-page
 * login landing back here because (main)/layout.tsx still sees
 * onboardingCompleted: false — including accounts that predate this flow
 * entirely (their onboardingCompleted was never true). This is the *only*
 * onboarding flow now: an already-authenticated visitor with nothing to
 * resume just gets the same steps a guest gets, minus Account Creation
 * (handleReviewDone bulk-persists immediately instead of showing that
 * step, since a session already exists) — any pre-existing profile fields
 * from before this flow existed are simply overwritten by whatever they
 * enter here.
 */
export function GuestIntroFlow({ authenticatedProfile }: { authenticatedProfile?: OnboardingProfile }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("steps");
  const [week, setWeek] = useState<StartingWeekDay[] | null>(null);
  const [postSignupSaving, setPostSignupSaving] = useState(false);
  const [postSignupError, setPostSignupError] = useState<string | null>(null);
  // Whether a session exists is known two ways: authenticatedProfile (this
  // page's own server-side check, present from first paint) and this —
  // client-detected, needed because Supabase's email-confirmation redirect
  // only establishes the session AFTER this component has already mounted
  // (the confirm link's tokens are exchanged client-side on load), so the
  // very first server render still sees a guest even though the browser is
  // about to become authenticated moments later.
  const [clientSignedIn, setClientSignedIn] = useState(false);
  const { draft, patch, patchDailyCare, clear, hydrated } = useOnboardingDraft();
  const persistStartedRef = useRef(false);

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

  // Tracks auth state client-side (see clientSignedIn's doc comment above).
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) setClientSignedIn(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setClientSignedIn(true);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!authenticatedProfile || clientSignedIn;
  const hasResumableDraft = draft.stage !== null && RESUMABLE_STAGES.includes(draft.stage);

  const stepCount = draft.routinePreference === "create_for_me" ? PATH_A_STEP_COUNT : INTRO_STEP_COUNT;

  function handleContinue() {
    if (step < stepCount - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Last step of Path A (Cautions) — deterministic, no network call, so
    // no loading state needed unlike OnboardingFlow's equivalent.
    setWeek(generateStartingWeek(draft, draft.inspiration ?? undefined));
    setPhase("review");
  }

  function handleReviewDone() {
    if (!week) return;
    patch({ generatedWeek: week, stage: "routine_ready" });
    // Already have a session (e.g. an existing account with incomplete
    // onboarding walking this flow fresh) — no need to show Account
    // Creation, just persist straight away.
    if (isAuthenticated) {
      void persistAndAdvanceToDailyCare();
    } else {
      setPhase("account");
    }
  }

  // Bulk-writes the draft to Supabase and advances to Daily Care — shared
  // by two callers: AccountCreationStep's onCreated (a fresh signUp() that
  // returned an active session immediately) and the resume effect below
  // (an already-authenticated reload/redirect finding stage routine_ready
  // or awaiting_auth). Retriable: a failure here leaves the user on the
  // same screen with an account but nothing saved yet, rather than
  // silently losing the routine they just built.
  async function persistAndAdvanceToDailyCare() {
    setPostSignupSaving(true);
    setPostSignupError(null);
    try {
      await saveOnboardingProfile(draft);
      if (draft.generatedWeek) {
        await saveStartingWeekToMove(draft.generatedWeek);
      }
      patch({ stage: "daily_care" });
      setPhase("dailyCare");
    } catch (err) {
      setPostSignupError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setPostSignupSaving(false);
    }
  }

  async function handleDailyCareContinue() {
    setPostSignupSaving(true);
    setPostSignupError(null);
    try {
      await updateSettings(draft.dailyCare);
      patch({ stage: "body_check_in" });
      setPhase("bodyCheckIn");
    } catch (err) {
      setPostSignupError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setPostSignupSaving(false);
    }
  }

  async function handleFinish() {
    setPostSignupSaving(true);
    setPostSignupError(null);
    try {
      await saveOnboardingProfile({ onboardingCompleted: true });
      await updateSettings({ programStartedAt: new Date().toISOString() });
      clear();
      // stage isn't patched to "complete" here — clear() already wiped the
      // draft back to DEFAULT_ONBOARDING_DRAFT (stage: null), and there's
      // nothing left to resume from this point on regardless.
      setPhase("complete");
    } catch (err) {
      setPostSignupError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setPostSignupSaving(false);
    }
  }

  // The resume decision — see this component's doc comment for the three
  // entry points this covers. Gated on `hydrated` since the draft isn't
  // readable until the localStorage effect resolves. Nothing to do when
  // there's no resumable draft: the render below already defaults to a
  // fresh step-0 flow, correct for both a genuine guest and an
  // authenticated visitor with nothing to resume.
  useEffect(() => {
    if (!hydrated || !hasResumableDraft) return;

    if (!isAuthenticated) {
      // Still a guest, reopened mid-Account-Creation — skip straight back
      // to it instead of re-walking steps 0–6 (the week is already saved
      // in draft.generatedWeek).
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resuming from a persisted stage on mount, see this effect's doc comment
      setPhase("account");
      return;
    }

    if (draft.stage === "daily_care") {
      setPhase("dailyCare");
      return;
    }
    if (draft.stage === "body_check_in") {
      setPhase("bodyCheckIn");
      return;
    }
    // routine_ready or awaiting_auth, now authenticated: the bulk-persist
    // hasn't happened yet.
    if (!persistStartedRef.current) {
      persistStartedRef.current = true;
      void persistAndAdvanceToDailyCare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthenticated, hasResumableDraft, draft.stage]);

  if (phase === "review" && week) {
    return (
      <StartingWeekReview
        week={week}
        onWeekChange={setWeek}
        profile={draft}
        onStart={handleReviewDone}
        starting={false}
        error={null}
      />
    );
  }

  if (phase === "account") {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <AccountCreationStep
          onCreated={persistAndAdvanceToDailyCare}
          onAwaitingConfirmation={() => patch({ stage: "awaiting_auth" })}
        />
        {postSignupSaving && <p className="text-center text-[12px] text-text-muted">Saving your first week...</p>}
        {postSignupError && <p className="text-center text-[12px] text-error">{postSignupError}</p>}
      </div>
    );
  }

  if (phase === "dailyCare") {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <DailyCareStep dailyCare={draft.dailyCare} onChange={patchDailyCare} />
        {postSignupError && <p className="text-center text-[12px] text-error">{postSignupError}</p>}
        <button
          type="button"
          onClick={handleDailyCareContinue}
          disabled={postSignupSaving}
          className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          {postSignupSaving ? "Saving..." : "Continue"}
        </button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          <CheckIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">You&apos;re all set.</h1>
          <p className="mx-auto mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-text-secondary">
            Your first week is saved and ready whenever you are.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full text-[15px] font-bold text-text-inverse"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          Go to Today
        </button>
      </div>
    );
  }

  if (phase === "bodyCheckIn") {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <OnboardingBannerImage src="/onboading-images/shot.webp" />
        <div>
          <p className="text-[13px] font-semibold text-text-secondary">Optional, but a nice place to start</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text-primary">Your first Shape Shot</h1>
          <p className="mt-1.5 text-[12px] text-text-muted">
            A quiet way to notice change over time. You can always add this later from Body.
          </p>
        </div>
        <BodyCapture entries={[]} />
        {postSignupError && <p className="text-center text-[12px] text-error">{postSignupError}</p>}
        <button
          type="button"
          onClick={handleFinish}
          disabled={postSignupSaving}
          className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          {postSignupSaving ? "Finishing up..." : "Start moving"}
        </button>
      </div>
    );
  }

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
            style={{ width: `${((step + 1) / stepCount) * 100}%`, background: "var(--gradient-primary)" }}
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
        {step === 3 && (
          <FocusAreaStep focusAreas={draft.focusAreas} onChange={(focusAreas) => patch({ focusAreas })} />
        )}
        {step === 4 && (
          <MyWeekStep
            workoutDays={draft.workoutDays}
            minutesPerSession={draft.minutesPerSession}
            experience={draft.experience}
            onChange={patch}
          />
        )}
        {step === 5 && <EquipmentStep equipment={draft.equipment} onChange={patch} />}
        {step === 6 && (
          <CautionsStep cautions={draft.cautions} avoidedExercisesNote={draft.avoidedExercisesNote} onChange={patch} />
        )}
      </div>

      {step === 2 && draft.routinePreference === "own_routine" ? (
        <p className="text-center text-[12px] text-text-muted">Saved — we&apos;ll pick this up next.</p>
      ) : (
        (step !== 2 || draft.routinePreference === "create_for_me") && (
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinueForStep(step, draft)}
            className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
          >
            {step === 0 ? "Get started" : "Continue"}
          </button>
        )
      )}
    </div>
  );
}
