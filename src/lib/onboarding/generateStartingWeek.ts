import { WEEKDAY_EN_TO_KO } from "@/lib/aiRoutine/types";
import type { Equipment, WeekdayEn } from "@/lib/aiRoutine/types";
import { EXERCISE_LIBRARY } from "./exercises";
import type { ExerciseTemplate, MovementPattern, StartingWeight, WorkoutType } from "./exercises";
import type { CautionArea, ExperienceLevel, FocusArea, OnboardingProfile, WorkoutDaysPerWeek } from "./types";

/** Visual-direction pick from the Inspiration onboarding step — never an
 * input to the hard filters below (equipment/caution/difficulty/explicit
 * Focus Areas). It only ever breaks a genuine tie between exercises that
 * already survived every other rule and share the same `priority`. */
export type Inspiration = "slim" | "toned" | "curvy" | "strong";

/** Which ShapeGoal tags each Inspiration pick leans toward, for the
 * tie-break in pickFromSlot() below — deliberately loose/overlapping, this
 * is flavor, not a real constraint. */
const INSPIRATION_SHAPE_GOALS: Record<Inspiration, ExerciseTemplate["shapeGoal"]> = {
  slim: ["leg_line", "waist_line"],
  toned: ["arm_line", "waist_line", "upper_body_line"],
  curvy: ["glute_shape", "side_glutes"],
  strong: ["back_line", "upper_body_line", "shoulder_line"],
};

export type StartingWeekExercise = {
  name: string;
  targetSets: number;
  repsMin: number;
  repsMax: number;
  startingWeight: StartingWeight;
};

export type StartingWeekDay = {
  weekday: string; // "월".."일" — same tokens workout_routines.days already uses
  dayType: WorkoutType | "rest";
  label: string;
  minutes: number | null; // null for rest days
  warmup: string[]; // empty for rest days
  exercises: StartingWeekExercise[]; // empty for rest days
};

const WEEK_ORDER_EN: WeekdayEn[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const WORKOUT_TYPE_LABEL: Record<WorkoutType, string> = {
  full_body: "Full Body",
  lower_body: "Lower Body",
  glutes: "Glutes",
  upper_body: "Upper Body",
  back_shoulders: "Back & Shoulders",
  arms_shoulders: "Arms & Shoulders",
  core_waist: "Core & Waist",
};

/**
 * Each workout type's slot list — the movement patterns a day of that type
 * is built from, in order. A slot is itself a small preference-ordered list
 * of acceptable patterns (e.g. Upper Body's "shoulder" slot accepts either
 * a side-delt or a shoulder-press move) so a day never comes up short just
 * because the single most literal pattern has no eligible candidate.
 * Extra exercises beyond a type's base slot count (60min+ sessions) cycle
 * back through the same list rather than needing dedicated 6th/7th slots.
 */
const WORKOUT_TYPE_SLOTS: Record<WorkoutType, MovementPattern[][]> = {
  full_body: [
    ["main_compound"],
    ["hinge", "thrust_bridge"],
    ["vertical_pull", "horizontal_pull"],
    ["side_delt", "shoulder_press"],
    ["flexion", "lateral_oblique", "deep_core_stability", "anti_rotation"],
  ],
  lower_body: [["main_compound"], ["thrust_bridge", "hinge"], ["hamstring"], ["unilateral"], ["isolation_lower", "side_glute"]],
  glutes: [["thrust_bridge"], ["hinge"], ["unilateral"], ["side_glute"], ["isolation_finisher"]],
  upper_body: [["vertical_pull"], ["horizontal_pull"], ["side_delt", "shoulder_press"], ["biceps", "triceps"], ["chest_optional"]],
  back_shoulders: [["vertical_pull"], ["horizontal_pull"], ["side_delt"], ["rear_delt"], ["accessory", "rear_delt"]],
  arms_shoulders: [["shoulder_press"], ["side_delt"], ["rear_delt"], ["biceps"], ["triceps"]],
  core_waist: [["flexion"], ["lateral_oblique"], ["deep_core_stability"], ["anti_rotation"]],
};

type FocusKey = Exclude<FocusArea, "full_body"> | "default";

/**
 * Weekly split lookup — every "X & Y" / "X + Y" label from the user's
 * spec collapses to its first (primary) type here; the secondary emphasis
 * is left to the exercise pool's natural overlap (e.g. "Lower Body &
 * Glutes" just uses "lower_body", whose pool already includes Hip
 * Thrust/RDL/Step Up) rather than a separate blended-type system — except
 * for Core, which gets its own explicit finisher-slot mechanism below
 * since core_waist doesn't share exercises with any other type. Rows not
 * given an explicit table by the user fall back to "default" for that day
 * count. "full_body" as a focus is handled separately (see
 * splitSequenceForWeek) since it's exclusive of every other focus.
 */
const WEEKLY_SPLIT: Record<WorkoutDaysPerWeek, Record<FocusKey, WorkoutType[]>> = {
  2: {
    default: ["full_body", "full_body"],
    glutes: ["full_body", "full_body"],
    legs: ["full_body", "full_body"],
    back: ["full_body", "full_body"],
    shoulders: ["full_body", "full_body"],
    arms: ["full_body", "full_body"],
    core: ["full_body", "full_body"],
  },
  3: {
    default: ["lower_body", "upper_body", "full_body"],
    glutes: ["lower_body", "upper_body", "glutes"],
    legs: ["lower_body", "upper_body", "lower_body"],
    core: ["full_body", "upper_body", "lower_body"],
    back: ["lower_body", "back_shoulders", "full_body"],
    shoulders: ["lower_body", "back_shoulders", "full_body"],
    arms: ["lower_body", "upper_body", "full_body"],
  },
  4: {
    default: ["lower_body", "upper_body", "glutes", "back_shoulders"],
    glutes: ["glutes", "upper_body", "lower_body", "back_shoulders"],
    legs: ["lower_body", "upper_body", "lower_body", "back_shoulders"],
    core: ["lower_body", "upper_body", "glutes", "back_shoulders"],
    back: ["lower_body", "back_shoulders", "glutes", "upper_body"],
    shoulders: ["lower_body", "back_shoulders", "glutes", "arms_shoulders"],
    arms: ["lower_body", "upper_body", "glutes", "arms_shoulders"],
  },
  5: {
    default: ["glutes", "back_shoulders", "lower_body", "arms_shoulders", "full_body"],
    glutes: ["glutes", "back_shoulders", "lower_body", "upper_body", "glutes"],
    legs: ["glutes", "back_shoulders", "lower_body", "arms_shoulders", "full_body"],
    core: ["lower_body", "back_shoulders", "glutes", "upper_body", "full_body"],
    back: ["lower_body", "back_shoulders", "glutes", "arms_shoulders", "upper_body"],
    shoulders: ["lower_body", "back_shoulders", "glutes", "arms_shoulders", "upper_body"],
    arms: ["glutes", "back_shoulders", "lower_body", "arms_shoulders", "full_body"],
  },
};

const WARMUP_PRESETS: Record<"lower_glutes" | "upper" | "full_body", string[]> = {
  lower_glutes: ["Bodyweight Glute Bridge", "Band Side Walk", "Hip Hinge Drill", "Dynamic Hip Stretch"],
  upper: ["Arm Circles", "Shoulder Rolls", "Band Pull Apart", "Light Cable Row"],
  full_body: ["March in Place", "Bodyweight Glute Bridge", "Bird Dog", "Arm Circles"],
};

function warmupFor(type: WorkoutType): string[] {
  if (type === "lower_body" || type === "glutes") return WARMUP_PRESETS.lower_glutes;
  if (type === "upper_body" || type === "back_shoulders" || type === "arms_shoulders") return WARMUP_PRESETS.upper;
  return WARMUP_PRESETS.full_body; // full_body, core_waist
}

/** Determines which of the week's selected days should end up which
 * workout type. Up to 3 selected Focus Areas get equal weight — a plain
 * round-robin across each selected focus's own split-table row — rather
 * than one focus dominating the whole week. "full_body" as a focus is
 * exclusive (enforced by the UI) and always just repeats "full_body". */
function splitSequenceForWeek(daysPerWeek: WorkoutDaysPerWeek, focusAreas: FocusArea[]): WorkoutType[] {
  if (focusAreas.includes("full_body")) return Array(daysPerWeek).fill("full_body");

  const table = WEEKLY_SPLIT[daysPerWeek];
  if (focusAreas.length === 0) return table.default;

  const rows = focusAreas.map((f) => table[f as FocusKey] ?? table.default);
  return Array.from({ length: daysPerWeek }, (_, i) => rows[i % rows.length][i]);
}

/** 30min = 4 exercises @ 3 sets; 45min = 5 @ 3; 60min = 5-6 (first
 * exercise gets 4 sets, rest 3); 75+min = 6-7, capped lower for "new"
 * experience regardless of the duration picked. */
function volumeForDuration(
  minutes: number,
  experience: ExperienceLevel,
): { exerciseCount: number; mainSets: number; accessorySets: number } {
  if (minutes <= 30) return { exerciseCount: 4, mainSets: 3, accessorySets: 3 };
  if (minutes <= 45) return { exerciseCount: 5, mainSets: 3, accessorySets: 3 };
  if (minutes <= 60) return { exerciseCount: experience === "new" ? 5 : 6, mainSets: 4, accessorySets: 3 };
  return { exerciseCount: experience === "new" ? 6 : 7, mainSets: 4, accessorySets: 3 };
}

/** New = beginner-only, 2-3 sets, 10-15 reps; Occasionally = beginner +
 * intermediate, 3 sets, 8-15; Consistently = beginner + intermediate,
 * 3-4 sets, 8-15; Experienced = beginner + intermediate freely, 3-4 sets,
 * 6-15. No "advanced" tier needed for v1. Sets from volumeForDuration()
 * take priority for "new" (capped at 3 max) since a first-timer shouldn't
 * jump to 4 sets just because they picked a longer session. */
function repsForExperience(experience: ExperienceLevel): { min: number; max: number } {
  if (experience === "new") return { min: 10, max: 15 };
  if (experience === "experienced") return { min: 6, max: 15 };
  return { min: 8, max: 15 };
}

function difficultyAllowed(experience: ExperienceLevel, difficulty: ExerciseTemplate["difficulty"]): boolean {
  if (experience === "new") return difficulty === "beginner";
  return true;
}

function equipmentSatisfied(required: Equipment[], available: Equipment[]): boolean {
  return required.every((e) => available.includes(e));
}

/** `"exclude"`-severity cautions remove a candidate outright; `"review"`
 * ones just push it to the back of its slot instead of removing it — see
 * exercises.ts's CautionTag doc for why blanket exclusion isn't used. */
function cautionOutcome(exercise: ExerciseTemplate, protectedAreas: CautionArea[]): "clean" | "flagged" | "excluded" {
  let flagged = false;
  for (const tag of exercise.cautions) {
    if (!protectedAreas.includes(tag.area)) continue;
    if (tag.severity === "exclude") return "excluded";
    flagged = true;
  }
  return flagged ? "flagged" : "clean";
}

function eligibleForSlot(
  patterns: MovementPattern[],
  type: WorkoutType,
  profile: OnboardingProfile,
  usedNames: Set<string>,
  allowFinisherPool: boolean,
): ExerciseTemplate[] {
  const protectedAreas = profile.cautions.filter((c): c is CautionArea => typeof c === "string") as CautionArea[];
  const pool = allowFinisherPool ? EXERCISE_LIBRARY : EXERCISE_LIBRARY.filter((e) => e.workoutType.includes(type));

  const candidates = pool.filter(
    (e) =>
      patterns.includes(e.movementPattern) &&
      !usedNames.has(e.name) &&
      equipmentSatisfied(e.equipment, profile.equipment) &&
      difficultyAllowed(profile.experience ?? "occasional", e.difficulty) &&
      cautionOutcome(e, protectedAreas) !== "excluded",
  );

  // Clean candidates (no protected-area overlap at all) sort ahead of
  // merely-flagged ones; priority breaks ties within each group.
  return candidates.sort((a, b) => {
    const aFlagged = cautionOutcome(a, protectedAreas) === "flagged" ? 1 : 0;
    const bFlagged = cautionOutcome(b, protectedAreas) === "flagged" ? 1 : 0;
    if (aFlagged !== bFlagged) return aFlagged - bFlagged;
    return a.priority - b.priority;
  });
}

function pickFromSlot(
  patternOptions: MovementPattern[][],
  type: WorkoutType,
  profile: OnboardingProfile,
  usedNames: Set<string>,
  inspiration: Inspiration | undefined,
  allowFinisherPool = false,
): ExerciseTemplate | null {
  for (const patterns of patternOptions) {
    const candidates = eligibleForSlot(patterns, type, profile, usedNames, allowFinisherPool);
    if (candidates.length === 0) continue;

    const topPriority = candidates[0].priority;
    const tied = candidates.filter((c) => c.priority === topPriority);
    if (tied.length === 1 || !inspiration) return tied[0];

    const preferred = INSPIRATION_SHAPE_GOALS[inspiration];
    const byAffinity = tied.find((c) => c.shapeGoal.some((g) => preferred.includes(g)));
    return byAffinity ?? tied[0];
  }
  return null;
}

function buildDayExercises(
  type: WorkoutType,
  profile: OnboardingProfile,
  inspiration: Inspiration | undefined,
): StartingWeekExercise[] {
  const { exerciseCount, mainSets, accessorySets } = volumeForDuration(
    profile.minutesPerSession ?? 45,
    profile.experience ?? "occasional",
  );
  const reps = repsForExperience(profile.experience ?? "occasional");
  const baseSlots = WORKOUT_TYPE_SLOTS[type];
  const hasCoreFocus = profile.focusAreas.includes("core") && type !== "core_waist";

  const usedNames = new Set<string>();
  const picked: ExerciseTemplate[] = [];

  for (let i = 0; i < exerciseCount; i++) {
    // Core finisher: the LAST slot of a non-core day becomes a Core &
    // Waist pick when "core" is a selected focus area — this is how every
    // "+ Core" / "& Core" suffix in the split spec actually manifests,
    // since core_waist shares no exercises with the other 6 types.
    const isFinisherSlot = hasCoreFocus && i === exerciseCount - 1;
    const slot = isFinisherSlot ? WORKOUT_TYPE_SLOTS.core_waist[0] : baseSlots[i % baseSlots.length];
    const found = pickFromSlot(
      isFinisherSlot ? WORKOUT_TYPE_SLOTS.core_waist : [slot],
      isFinisherSlot ? "core_waist" : type,
      profile,
      usedNames,
      inspiration,
      isFinisherSlot,
    );
    if (!found) continue; // every slot has multiple fallback patterns; an empty result means equipment/cautions genuinely ruled out this whole family for this user — skip rather than crash
    usedNames.add(found.name);
    picked.push(found);
  }

  return picked.map((exercise, index) => ({
    name: exercise.name,
    targetSets: index === 0 ? mainSets : accessorySets,
    repsMin: reps.min,
    repsMax: reps.max,
    startingWeight: exercise.startingWeight,
  }));
}

/**
 * Routine Generator v1 — fully deterministic, no AI call. Same profile
 * always produces the same week.
 */
export function generateStartingWeek(profile: OnboardingProfile, inspiration?: Inspiration): StartingWeekDay[] {
  const scheduledDays = new Set(profile.workoutDays);
  const daysPerWeek = Math.min(5, Math.max(2, profile.workoutDays.length || profile.daysPerWeek || 3)) as WorkoutDaysPerWeek;
  const sequence = splitSequenceForWeek(daysPerWeek, profile.focusAreas);

  // Only the days the user actually selected get a type assigned, in
  // chronological (Mon-Sun) order — matches sequence[] 1:1.
  let scheduledIndex = 0;

  return WEEK_ORDER_EN.map((weekdayEn) => {
    const weekdayKo = WEEKDAY_EN_TO_KO[weekdayEn];
    if (!scheduledDays.has(weekdayEn)) {
      return { weekday: weekdayKo, dayType: "rest" as const, label: "Rest", minutes: null, warmup: [], exercises: [] };
    }

    const type = sequence[Math.min(scheduledIndex, sequence.length - 1)];
    scheduledIndex += 1;

    return {
      weekday: weekdayKo,
      dayType: type,
      label: WORKOUT_TYPE_LABEL[type],
      minutes: profile.minutesPerSession ?? 45,
      warmup: warmupFor(type),
      exercises: buildDayExercises(type, profile, inspiration),
    };
  });
}
