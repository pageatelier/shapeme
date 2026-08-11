import { createClient } from "@/lib/supabase/client";
import type { OnboardingProfile } from "./types";

/**
 * Persists a partial onboarding-profile patch into the user's auth metadata
 * (merged, not replaced) — same pattern as updateSettings() in
 * settings/mutations.ts. Each onboarding step calls this with just the
 * fields it collected, so a user can leave mid-flow without losing earlier
 * steps' answers.
 */
export async function saveOnboardingProfile(patch: Partial<OnboardingProfile>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be logged in.");

  const data: Record<string, unknown> = {};
  if (patch.language !== undefined) data.language = patch.language;
  if (patch.country !== undefined) data.country = patch.country;
  if (patch.bodyGoals !== undefined) data.body_goals = patch.bodyGoals;
  if (patch.focusAreas !== undefined) data.focus_areas = patch.focusAreas;
  if (patch.workoutDays !== undefined) data.workout_days = patch.workoutDays;
  if (patch.daysPerWeek !== undefined) data.days_per_week = patch.daysPerWeek;
  if (patch.place !== undefined) data.workout_place = patch.place;
  if (patch.minutesPerSession !== undefined) data.minutes_per_session = patch.minutesPerSession;
  if (patch.experience !== undefined) data.experience_level = patch.experience;
  if (patch.cautions !== undefined) data.cautions = patch.cautions;
  if (patch.avoidedExercisesNote !== undefined) data.avoided_exercises_note = patch.avoidedExercisesNote;
  if (patch.equipment !== undefined) data.equipment = patch.equipment;
  if (patch.onboardingCompleted !== undefined) data.onboarding_completed = patch.onboardingCompleted;

  const { error } = await supabase.auth.updateUser({ data });
  if (error) throw error;
}
