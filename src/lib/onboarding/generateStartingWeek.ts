import { CORE_EXERCISES, EXERCISE_POOL_BY_DAY_TYPE } from "./exercises";
import type { ExerciseDayType, ExerciseTemplate } from "./exercises";
import { FOCUS_AREA_OPTIONS } from "./types";
import type { FocusArea, OnboardingProfile, WorkoutDaysPerWeek } from "./types";

export type StartingWeekExercise = {
  name: string;
  targetSets: number;
  targetReps: number;
  suggestedWeightKg: number | null;
};

export type StartingWeekDay = {
  weekday: string; // "월".."일" — same tokens workout_routines.days already uses
  dayType: ExerciseDayType | "rest";
  label: string; // "Lower · Glutes" or "Rest / Gentle movement"
  minutes: number | null; // null for rest days
  exercises: StartingWeekExercise[]; // empty for rest days
};

const WEEK_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

const SCHEDULE_TEMPLATES: Record<WorkoutDaysPerWeek, string[]> = {
  2: ["월", "목"],
  3: ["월", "수", "금"],
  4: ["월", "화", "목", "금"],
  5: ["월", "화", "수", "목", "금"],
};

const EXERCISE_COUNT_BY_MINUTES: Record<number, number> = { 30: 3, 45: 4, 60: 5 };

const LOWER_FOCUS: FocusArea[] = ["glutes", "legs"];
const UPPER_FOCUS: FocusArea[] = ["back", "shoulders", "arms"];

const FOCUS_LABEL = Object.fromEntries(FOCUS_AREA_OPTIONS.map((o) => [o.value, o.label])) as Record<
  FocusArea,
  string
>;

function experienceMultiplier(experience: OnboardingProfile["experience"]): number {
  if (experience === "beginner") return 0.7;
  if (experience === "consistent") return 1.2;
  return 1; // "some" or unanswered
}

/** Rounds to the nearest 1kg for bodypart-isolation weights, 2.5kg above
 * 20kg where gym plates/dumbbells usually step in bigger increments. */
function roundWeight(kg: number): number {
  const step = kg >= 20 ? 2.5 : 1;
  return Math.round(kg / step) * step;
}

function fitsPlace(exercise: ExerciseTemplate, place: OnboardingProfile["place"]): boolean {
  if (exercise.place === "both") return true;
  if (!place || place === "both") return true;
  return exercise.place === place;
}

function passesCautions(exercise: ExerciseTemplate, cautions: OnboardingProfile["cautions"]): boolean {
  return !exercise.avoidIfCaution.some((c) => cautions.includes(c));
}

function passesAvoidedNote(exercise: ExerciseTemplate, note: string): boolean {
  const trimmed = note.trim().toLowerCase();
  if (!trimmed) return true;
  return !exercise.name.toLowerCase().includes(trimmed);
}

/** The eligible+narrowed candidate list a day's exercises are drawn from —
 * exposed via swapExercise() below so "Change a workout" picks from exactly
 * the same pool the original generation did. */
function eligiblePool(dayType: ExerciseDayType, profile: OnboardingProfile): ExerciseTemplate[] {
  const eligible = EXERCISE_POOL_BY_DAY_TYPE[dayType].filter(
    (e) => fitsPlace(e, profile.place) && passesCautions(e, profile.cautions) && passesAvoidedNote(e, profile.avoidedExercisesNote),
  );

  // Narrow further to exercises matching the user's actual selected focus
  // areas for this day type (e.g. "arms" only shouldn't pull in shoulder
  // presses just because they're both "upper") — falls back to the wider
  // eligible pool if that leaves nothing, so a narrow pick never zeroes out.
  const relevantFocus = profile.focusAreas.filter((f) =>
    (dayType === "lower" ? LOWER_FOCUS : dayType === "upper" ? UPPER_FOCUS : []).includes(f),
  );
  const narrowed =
    relevantFocus.length > 0 ? eligible.filter((e) => e.focus.some((f) => relevantFocus.includes(f))) : eligible;
  return narrowed.length > 0 ? narrowed : eligible;
}

function pickExercises(
  dayType: ExerciseDayType,
  count: number,
  offset: number,
  profile: OnboardingProfile,
): ExerciseTemplate[] {
  const pool = eligiblePool(dayType, profile);
  if (pool.length === 0) return [];
  const picked: ExerciseTemplate[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    picked.push(pool[(offset + i) % pool.length]);
  }
  return picked;
}

/**
 * "Change a workout" — the next candidate (by name) from the same pool a
 * day's exercises were drawn from, excluding whatever's already on that day
 * so a swap never produces a duplicate. `attempt` cycles through the
 * remaining candidates on repeated taps of the same slot. Returns null if
 * every eligible exercise for this day type is already in use.
 */
export function swapExercise(
  dayType: ExerciseDayType,
  currentNames: string[],
  attempt: number,
  profile: OnboardingProfile,
): StartingWeekExercise | null {
  const candidates = eligiblePool(dayType, profile).filter((e) => !currentNames.includes(e.name));
  if (candidates.length === 0) return null;
  return toStartingWeekExercise(candidates[attempt % candidates.length], profile.experience);
}

/** Picks one finisher move for days when "core" is a chosen focus area (see
 * generateStartingWeek's hasCore branch) — cycled by `offset` so it's not
 * the same move on every core-including day of the week. */
function pickCoreExercise(offset: number, profile: OnboardingProfile): ExerciseTemplate | null {
  const pool = CORE_EXERCISES.filter(
    (e) => passesCautions(e, profile.cautions) && passesAvoidedNote(e, profile.avoidedExercisesNote),
  );
  if (pool.length === 0) return null;
  return pool[offset % pool.length];
}

function toStartingWeekExercise(template: ExerciseTemplate, experience: OnboardingProfile["experience"]): StartingWeekExercise {
  return {
    name: template.name,
    targetSets: template.defaultSets,
    targetReps: template.defaultReps,
    suggestedWeightKg:
      template.baseWeightKg == null ? null : roundWeight(template.baseWeightKg * experienceMultiplier(experience)),
  };
}

function dayLabel(dayType: ExerciseDayType, focusAreas: FocusArea[]): string {
  if (dayType === "full_body") return "Full Body";
  const relevant = dayType === "lower" ? LOWER_FOCUS : UPPER_FOCUS;
  const labels = focusAreas.filter((f) => relevant.includes(f)).map((f) => FOCUS_LABEL[f]);
  const prefix = dayType === "lower" ? "Lower" : "Upper";
  return labels.length > 0 ? `${prefix} · ${labels.join(" & ")}` : prefix;
}

/**
 * Deterministic stand-in for Phase 2's real AI call (blocked on OpenAI
 * billing — see project notes). Same profile + seed always produces the
 * same week — nothing needs to persist the result between onboarding
 * screens, it can just be regenerated. `seed` is "Regenerate": bumping it
 * shifts which candidates each day draws from without changing the day/rest
 * schedule itself, so a regenerate reads as "different exercises," not "a
 * different plan structure."
 */
export function generateStartingWeek(profile: OnboardingProfile, seed = 0): StartingWeekDay[] {
  const daysPerWeek = profile.daysPerWeek ?? 3;
  const scheduledDays = new Set(SCHEDULE_TEMPLATES[daysPerWeek]);
  const exerciseCount = EXERCISE_COUNT_BY_MINUTES[profile.minutesPerSession ?? 45] ?? 4;

  const hasLower = profile.focusAreas.some((f) => LOWER_FOCUS.includes(f));
  const hasUpper = profile.focusAreas.some((f) => UPPER_FOCUS.includes(f));
  const hasFullBody = profile.focusAreas.includes("full_body");
  const hasCore = profile.focusAreas.includes("core");

  function dayTypeForOccurrence(occurrenceIndex: number): ExerciseDayType {
    if (hasFullBody || (!hasLower && !hasUpper)) return "full_body";
    if (hasLower && hasUpper) return occurrenceIndex % 2 === 0 ? "lower" : "upper";
    return hasLower ? "lower" : "upper";
  }

  // How many workout days already happened before this one, per type — used
  // to offset the exercise pool so a repeated day type isn't identical to
  // the last one (e.g. Monday Lower and Thursday Lower differ a bit).
  const occurrenceByType: Record<ExerciseDayType, number> = { lower: 0, upper: 0, full_body: 0 };
  let workoutDayIndex = 0;

  const days: StartingWeekDay[] = WEEK_ORDER.map((weekday) => {
    if (!scheduledDays.has(weekday)) {
      return { weekday, dayType: "rest" as const, label: "Rest", minutes: null, exercises: [] };
    }

    const dayType = dayTypeForOccurrence(occurrenceByType.lower + occurrenceByType.upper + occurrenceByType.full_body);
    const occurrence = occurrenceByType[dayType];
    occurrenceByType[dayType] += 1;

    // One slot is reserved for a core finisher when "core" is a focus area.
    const mainCount = hasCore && exerciseCount > 1 ? exerciseCount - 1 : exerciseCount;
    const picked = pickExercises(dayType, mainCount, occurrence * exerciseCount + seed, profile);
    const exercises = picked.map((t) => toStartingWeekExercise(t, profile.experience));

    if (hasCore) {
      const core = pickCoreExercise(workoutDayIndex + seed, profile);
      if (core) exercises.push(toStartingWeekExercise(core, profile.experience));
    }
    workoutDayIndex += 1;

    return {
      weekday,
      dayType,
      label: dayLabel(dayType, profile.focusAreas),
      minutes: profile.minutesPerSession ?? 45,
      exercises,
    };
  });

  // Single isolated rest days ("deload" mid-week) read as "Rest / Gentle
  // movement"; a consecutive rest block (weekend) reads as a plain "Rest"
  // each — matches the onboarding spec's own MON..SUN example.
  for (let i = 0; i < days.length; i++) {
    if (days[i].dayType !== "rest") continue;
    const prevIsRest = i > 0 && days[i - 1].dayType === "rest";
    const nextIsRest = i < days.length - 1 && days[i + 1].dayType === "rest";
    days[i].label = prevIsRest || nextIsRest ? "Rest" : "Rest / Gentle movement";
  }

  return days;
}
