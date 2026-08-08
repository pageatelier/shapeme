import type { CautionArea, FocusArea, WorkoutPlace } from "./types";

export type ExerciseDayType = "lower" | "upper" | "full_body";

export type ExerciseTemplate = {
  name: string;
  focus: FocusArea[];
  /** "both" fits either place; "gym"/"home" is place-specific equipment. */
  place: WorkoutPlace | "both";
  avoidIfCaution: CautionArea[];
  defaultSets: number;
  defaultReps: number;
  /** Only set for weighted moves — bodyweight exercises stay null. A loose
   * starting point, not a target; scaled by experience in generateStartingWeek. */
  baseWeightKg: number | null;
};

/**
 * Small curated pool standing in for a real AI-generated set until Phase 2's
 * OpenAI billing is sorted out (see generateStartingWeek.ts). Deliberately
 * modest — enough variety per day type to avoid repeating a week, not an
 * exhaustive exercise database.
 */
export const LOWER_EXERCISES: ExerciseTemplate[] = [
  { name: "Dumbbell RDL", focus: ["glutes"], place: "gym", avoidIfCaution: ["lower_back"], defaultSets: 3, defaultReps: 10, baseWeightKg: 20 },
  { name: "Hip Thrust", focus: ["glutes"], place: "both", avoidIfCaution: ["lower_back"], defaultSets: 3, defaultReps: 12, baseWeightKg: 30 },
  { name: "Leg Press", focus: ["legs"], place: "gym", avoidIfCaution: ["knee"], defaultSets: 3, defaultReps: 10, baseWeightKg: 40 },
  { name: "Hip Abduction", focus: ["glutes"], place: "gym", avoidIfCaution: [], defaultSets: 3, defaultReps: 15, baseWeightKg: 20 },
  { name: "Leg Curl", focus: ["legs"], place: "gym", avoidIfCaution: ["knee"], defaultSets: 2, defaultReps: 12, baseWeightKg: 15 },
  { name: "Bodyweight Squat", focus: ["legs", "glutes"], place: "home", avoidIfCaution: ["knee"], defaultSets: 3, defaultReps: 15, baseWeightKg: null },
  { name: "Glute Bridge", focus: ["glutes"], place: "home", avoidIfCaution: ["lower_back"], defaultSets: 3, defaultReps: 15, baseWeightKg: null },
  { name: "Walking Lunge", focus: ["legs", "glutes"], place: "both", avoidIfCaution: ["knee"], defaultSets: 3, defaultReps: 12, baseWeightKg: 8 },
];

export const UPPER_EXERCISES: ExerciseTemplate[] = [
  { name: "Lat Pulldown", focus: ["back"], place: "gym", avoidIfCaution: ["shoulder"], defaultSets: 3, defaultReps: 10, baseWeightKg: 25 },
  { name: "Seated Row", focus: ["back"], place: "gym", avoidIfCaution: ["wrist"], defaultSets: 3, defaultReps: 10, baseWeightKg: 25 },
  { name: "Dumbbell Shoulder Press", focus: ["shoulders"], place: "both", avoidIfCaution: ["shoulder"], defaultSets: 3, defaultReps: 10, baseWeightKg: 8 },
  { name: "Lateral Raise", focus: ["shoulders"], place: "both", avoidIfCaution: ["shoulder"], defaultSets: 3, defaultReps: 12, baseWeightKg: 4 },
  { name: "Bicep Curl", focus: ["arms"], place: "both", avoidIfCaution: ["wrist"], defaultSets: 3, defaultReps: 12, baseWeightKg: 6 },
  { name: "Tricep Pushdown", focus: ["arms"], place: "gym", avoidIfCaution: ["wrist"], defaultSets: 3, defaultReps: 12, baseWeightKg: 12 },
  { name: "Resistance Band Row", focus: ["back"], place: "home", avoidIfCaution: [], defaultSets: 3, defaultReps: 12, baseWeightKg: null },
  { name: "Push-up", focus: ["arms", "shoulders"], place: "home", avoidIfCaution: ["wrist", "shoulder"], defaultSets: 3, defaultReps: 10, baseWeightKg: null },
];

export const FULL_BODY_EXERCISES: ExerciseTemplate[] = [
  { name: "Goblet Squat", focus: ["full_body", "legs"], place: "both", avoidIfCaution: ["knee"], defaultSets: 3, defaultReps: 10, baseWeightKg: 12 },
  { name: "Push-up", focus: ["full_body"], place: "home", avoidIfCaution: ["wrist", "shoulder"], defaultSets: 3, defaultReps: 10, baseWeightKg: null },
  { name: "Bent-over Row", focus: ["full_body", "back"], place: "gym", avoidIfCaution: ["lower_back"], defaultSets: 3, defaultReps: 10, baseWeightKg: 16 },
  { name: "Glute Bridge", focus: ["full_body", "glutes"], place: "home", avoidIfCaution: ["lower_back"], defaultSets: 3, defaultReps: 15, baseWeightKg: null },
  { name: "Step-up", focus: ["full_body", "legs"], place: "both", avoidIfCaution: ["knee"], defaultSets: 3, defaultReps: 10, baseWeightKg: 8 },
];

/** Reserved for the last exercise slot of any day when "core" is one of the
 * user's focus areas — a finisher, not its own scheduled day (see
 * generateStartingWeek.ts). */
export const CORE_EXERCISES: ExerciseTemplate[] = [
  { name: "Dead Bug", focus: ["core"], place: "both", avoidIfCaution: ["lower_back"], defaultSets: 3, defaultReps: 12, baseWeightKg: null },
  { name: "Bicycle Crunch", focus: ["core"], place: "both", avoidIfCaution: ["lower_back"], defaultSets: 3, defaultReps: 20, baseWeightKg: null },
  { name: "Mountain Climber", focus: ["core"], place: "both", avoidIfCaution: ["wrist"], defaultSets: 3, defaultReps: 20, baseWeightKg: null },
];

export const EXERCISE_POOL_BY_DAY_TYPE: Record<ExerciseDayType, ExerciseTemplate[]> = {
  lower: LOWER_EXERCISES,
  upper: UPPER_EXERCISES,
  full_body: FULL_BODY_EXERCISES,
};
