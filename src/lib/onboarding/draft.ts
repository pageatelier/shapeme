"use client";

import { useCallback, useEffect, useState } from "react";
import type { Inspiration, StartingWeekDay } from "./generateStartingWeek";
import { DEFAULT_ONBOARDING_PROFILE } from "./types";
import type { OnboardingProfile } from "./types";

export type RoutinePreference = "create_for_me" | "own_routine";

/**
 * Explicit resume anchor for the post-review tail — routing depends on
 * this, not on GuestIntroFlow's own transient `phase` useState, so a page
 * reload, a closed tab, or returning from the email-confirmation link (all
 * of which remount the component fresh) can resume in the right place
 * instead of restarting. Only the tail is tracked here: steps 0–6 and
 * Starting Week review don't need cross-reload resume beyond what the
 * per-field draft values already give for free (re-rendering the same step
 * index 0 is a fine "resume" for that part).
 *
 * - "routine_ready": Starting Week review is done, generatedWeek is set,
 *   about to show Account Creation.
 * - "awaiting_auth": signUp() was called and requires email confirmation
 *   (no session yet) — draft.generatedWeek is already final at this point.
 * - "daily_care" / "body_check_in": bulk-persist to Supabase has already
 *   happened; these two stages are post-auth-only.
 * - "complete": finalize() succeeded, immediately followed by clear() — in
 *   practice this value is only ever observed for an instant, since a
 *   cleared draft has no stage at all (see DEFAULT_ONBOARDING_DRAFT).
 */
export type OnboardingStage = "routine_ready" | "awaiting_auth" | "daily_care" | "body_check_in" | "complete";

export type DailyCarePreferences = {
  waterTrackingEnabled: boolean;
  mealTrackingEnabled: boolean;
  notificationsEnabled: boolean;
  selfLoveMessageEnabled: boolean;
};

export const DEFAULT_DAILY_CARE: DailyCarePreferences = {
  waterTrackingEnabled: true,
  mealTrackingEnabled: true,
  notificationsEnabled: true,
  selfLoveMessageEnabled: true,
};

/**
 * Superset of OnboardingProfile for the guest-first flow (steps 0–7 run
 * before an account exists) — everything collected along the way lives
 * here, in localStorage, until account creation triggers the real bulk
 * write (saveOnboardingProfile + saveStartingWeekToMove/importedRoutine +
 * updateSettings for dailyCare). routinePreference/importedRoutine only
 * apply to Path B ("I have my own routine"); Path A instead runs
 * generateStartingWeek() off the OnboardingProfile fields directly, same
 * as today.
 */
export type OnboardingDraft = OnboardingProfile & {
  inspiration: Inspiration | null;
  routinePreference: RoutinePreference | null;
  /** Path A's generated-then-edited week (see Phase 5's GuestIntroFlow) —
   * generateStartingWeek()'s output, patched in once the guest finishes
   * Starting Week review, so it survives through to the Phase 7 bulk write
   * without needing a session yet. */
  generatedWeek: StartingWeekDay[] | null;
  /** Path B's parsed/reviewed routine — reuses generateStartingWeek()'s own
   * output shape so the existing editable StartingWeekReview UI can run on
   * either path's result without a second review implementation. */
  importedRoutine: StartingWeekDay[] | null;
  dailyCare: DailyCarePreferences;
  /** null = still in the pre-review step flow (or nothing started yet) —
   * see OnboardingStage's doc comment for what each non-null value means. */
  stage: OnboardingStage | null;
};

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  ...DEFAULT_ONBOARDING_PROFILE,
  inspiration: null,
  routinePreference: null,
  generatedWeek: null,
  importedRoutine: null,
  dailyCare: DEFAULT_DAILY_CARE,
  stage: null,
};

const DRAFT_STORAGE_KEY = "silua.onboarding-draft.v1";

function readDraftFromStorage(): OnboardingDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_ONBOARDING_DRAFT, ...(JSON.parse(raw) as Partial<OnboardingDraft>) };
  } catch {
    // Corrupt/unparseable storage shouldn't block onboarding — fall back to
    // a fresh draft the same as a first-time visitor.
    return null;
  }
}

/**
 * localStorage-backed draft for the guest-first onboarding flow — survives
 * a page reload and an OAuth redirect's full-page navigation, unlike plain
 * useState. Hydration happens in an effect rather than the useState
 * initializer because localStorage isn't available during SSR (same
 * trade-off OnboardingFlow's browser-locale prefill already makes): the
 * form briefly renders defaults, then updates once on mount.
 */
export function useOnboardingDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readDraftFromStorage();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration, see doc comment above
      setDraft(stored);
    }
    setHydrated(true);
    // Mount-only: this hydrates once, it doesn't live-sync with storage.
  }, []);

  const patch = useCallback((p: Partial<OnboardingDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...p };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const patchDailyCare = useCallback((p: Partial<DailyCarePreferences>) => {
    setDraft((prev) => {
      const next = { ...prev, dailyCare: { ...prev.dailyCare, ...p } };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Called once the draft has been bulk-persisted after account creation —
  // leaves nothing behind for the next guest to accidentally inherit.
  const clear = useCallback(() => {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraft(DEFAULT_ONBOARDING_DRAFT);
  }, []);

  return { draft, patch, patchDailyCare, clear, hydrated };
}
