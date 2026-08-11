import type { Equipment } from "@/lib/aiRoutine/types";
import type { CautionArea } from "./types";

/**
 * The 7 workout types every generated day is built from (see
 * generateStartingWeek.ts's weekly-split table) — replaces the old
 * lower/upper/full_body 3-type model.
 */
export type WorkoutType =
  | "full_body"
  | "lower_body"
  | "glutes"
  | "upper_body"
  | "back_shoulders"
  | "arms_shoulders"
  | "core_waist";

/**
 * The "slot" an exercise fills within a workout type (e.g. Glutes =
 * thrust_bridge + hinge + unilateral + side_glute + isolation_finisher).
 * Several patterns are shared across types on purpose — e.g. vertical_pull
 * appears in both Upper Body and Back & Shoulders — so the same exercise
 * can fill the equivalent slot in either without duplicate tagging.
 */
export type MovementPattern =
  | "thrust_bridge"
  | "hinge"
  | "unilateral"
  | "side_glute"
  | "isolation_finisher"
  | "main_compound"
  | "isolation_lower"
  | "hamstring"
  | "vertical_pull"
  | "horizontal_pull"
  | "accessory"
  | "shoulder_press"
  | "side_delt"
  | "rear_delt"
  | "chest_optional"
  | "biceps"
  | "triceps"
  | "flexion"
  | "lateral_oblique"
  | "deep_core_stability"
  | "anti_rotation";

/** Display-only grouping, never used for filtering — feeds Inspiration's
 * tie-break only (see generateStartingWeek.ts). */
export type ShapeGoal =
  | "glute_shape"
  | "leg_line"
  | "back_line"
  | "shoulder_line"
  | "arm_line"
  | "waist_line"
  | "side_glutes"
  | "upper_body_line";

/** Structured, not a display string — the UI derives its own "Suggested
 * start" / "bodyweight" / etc. copy from the `type` discriminant instead of
 * parsing text. `perHand` distinguishes a single dumbbell/cable-stack value
 * from "this much in each hand." */
export type StartingWeight =
  | { type: "weight_range"; minKg: number; maxKg: number; perHand: boolean }
  | { type: "bodyweight" }
  | { type: "lightest_available" }
  | { type: "light_band" }
  | { type: "high_assistance" };

/**
 * `severity` is the reason this isn't a flat `CautionArea[]`: tagging every
 * area an exercise even lightly touches, then hard-excluding on any overlap
 * with a user's protected areas, wipes out most of the pool for a common
 * pick like "shoulder." `"review"` keeps the exercise eligible but
 * deprioritized (and, once the editable review ships, flagged) when it
 * overlaps a protected area; `"exclude"` is reserved for combos where the
 * movement directly loads or drives full range through that joint under
 * load — a smaller set, judged per exercise below, not a medical claim.
 */
export type CautionTag = { area: CautionArea; severity: "review" | "exclude" };

export type ExerciseTemplate = {
  name: string;
  /** Muscle group(s), display-only — free text, not a strict enum, since
   * the library spans everything from "glutes" to "hip_flexors." */
  target: string[];
  /** All required simultaneously (e.g. dumbbell AND bench for Dumbbell Hip
   * Thrust) — never "any of these," which is why some exercises collapse a
   * source table's "X, Y" equipment cell down to the single most
   * permissive/representative tag instead (see exercises.ts's inline notes
   * where that happened). */
  equipment: Equipment[];
  difficulty: "beginner" | "intermediate";
  cautions: CautionTag[];
  shapeGoal: ShapeGoal[];
  startingWeight: StartingWeight;
  workoutType: WorkoutType[];
  movementPattern: MovementPattern;
  /** Rank within its (workoutType, movementPattern) slot — 1 is the
   * deterministic default pick; "Replace" (Phase 2) steps to the next
   * value that survives equipment/exclude-severity-caution filtering. */
  priority: number;
};

const wr = (minKg: number, maxKg: number, perHand = false): StartingWeight => ({
  type: "weight_range",
  minKg,
  maxKg,
  perHand,
});
const BODYWEIGHT: StartingWeight = { type: "bodyweight" };
const LIGHTEST: StartingWeight = { type: "lightest_available" };
const LIGHT_BAND: StartingWeight = { type: "light_band" };
const HIGH_ASSIST: StartingWeight = { type: "high_assistance" };

const review = (area: CautionArea): CautionTag => ({ area, severity: "review" });
const exclude = (area: CautionArea): CautionTag => ({ area, severity: "exclude" });

/**
 * The canonical 50-exercise library. Every exercise is tagged for the
 * generator in generateStartingWeek.ts to filter/compose from — this file
 * holds no scheduling or composition logic itself, only exercise data.
 */
export const EXERCISE_LIBRARY: ExerciseTemplate[] = [
  // --- Glutes / Lower Body ---
  {
    name: "Hip Thrust",
    target: ["glutes"],
    equipment: ["barbell"],
    difficulty: "beginner",
    cautions: [review("lower_back"), exclude("hip")],
    shapeGoal: ["glute_shape"],
    startingWeight: wr(10, 20),
    workoutType: ["glutes", "lower_body", "full_body"],
    movementPattern: "thrust_bridge",
    priority: 1,
  },
  {
    name: "Dumbbell Hip Thrust",
    target: ["glutes"],
    equipment: ["dumbbell", "bench"],
    difficulty: "beginner",
    cautions: [review("lower_back"), review("hip")],
    shapeGoal: ["glute_shape"],
    startingWeight: wr(8, 12),
    workoutType: ["glutes", "lower_body", "full_body"],
    movementPattern: "thrust_bridge",
    priority: 2,
  },
  {
    name: "Glute Bridge",
    target: ["glutes"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("lower_back")],
    shapeGoal: ["glute_shape"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes", "lower_body", "full_body"],
    movementPattern: "thrust_bridge",
    priority: 3,
  },
  {
    name: "Frog Pump",
    target: ["glutes"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("hip")],
    shapeGoal: ["glute_shape"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes"],
    movementPattern: "isolation_finisher",
    priority: 2,
  },
  {
    name: "Romanian Deadlift",
    target: ["glutes", "hamstrings"],
    equipment: ["dumbbell"],
    difficulty: "intermediate",
    cautions: [exclude("lower_back")],
    shapeGoal: ["glute_shape", "leg_line"],
    startingWeight: wr(4, 6, true),
    workoutType: ["glutes", "lower_body", "full_body"],
    movementPattern: "hinge",
    priority: 1,
  },
  {
    name: "45° Back Extension — Glute Bias",
    target: ["glutes", "hamstrings"],
    equipment: ["machine"],
    difficulty: "intermediate",
    cautions: [exclude("lower_back")],
    shapeGoal: ["glute_shape"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes", "lower_body"],
    movementPattern: "hinge",
    priority: 2,
  },
  {
    name: "Bulgarian Split Squat",
    target: ["glutes", "quads"],
    equipment: ["dumbbell"],
    difficulty: "intermediate",
    cautions: [exclude("knee"), review("hip")],
    shapeGoal: ["glute_shape", "leg_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes", "lower_body"],
    movementPattern: "unilateral",
    priority: 4,
  },
  {
    name: "Reverse Lunge",
    target: ["glutes", "quads"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [review("knee"), review("hip")],
    shapeGoal: ["glute_shape", "leg_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes", "lower_body"],
    movementPattern: "unilateral",
    priority: 2,
  },
  {
    name: "Walking Lunge",
    target: ["glutes", "quads"],
    equipment: ["dumbbell"],
    difficulty: "intermediate",
    cautions: [review("knee"), review("hip")],
    shapeGoal: ["leg_line", "glute_shape"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes", "lower_body"],
    movementPattern: "unilateral",
    priority: 3,
  },
  {
    name: "Step Up",
    target: ["glutes", "quads"],
    equipment: ["bench", "dumbbell"],
    difficulty: "beginner",
    cautions: [exclude("knee")],
    shapeGoal: ["glute_shape", "leg_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes", "lower_body"],
    movementPattern: "unilateral",
    priority: 1,
  },
  {
    name: "Goblet Squat",
    target: ["quads", "glutes"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [review("knee"), review("lower_back")],
    shapeGoal: ["leg_line", "glute_shape"],
    startingWeight: wr(4, 6),
    workoutType: ["lower_body", "full_body"],
    movementPattern: "main_compound",
    priority: 2,
  },
  {
    name: "Leg Press",
    target: ["quads", "glutes"],
    equipment: ["leg_press"],
    difficulty: "beginner",
    cautions: [review("knee"), review("lower_back")],
    shapeGoal: ["leg_line", "glute_shape"],
    startingWeight: LIGHTEST,
    workoutType: ["lower_body", "full_body"],
    movementPattern: "main_compound",
    priority: 1,
  },
  {
    name: "Leg Extension",
    target: ["quads"],
    equipment: ["leg_extension"],
    difficulty: "beginner",
    cautions: [exclude("knee")],
    shapeGoal: ["leg_line"],
    startingWeight: LIGHTEST,
    workoutType: ["lower_body"],
    movementPattern: "isolation_lower",
    priority: 1,
  },
  {
    name: "Seated Leg Curl",
    target: ["hamstrings"],
    equipment: ["leg_curl"],
    difficulty: "beginner",
    cautions: [review("knee")],
    shapeGoal: ["leg_line"],
    startingWeight: LIGHTEST,
    workoutType: ["lower_body"],
    movementPattern: "hamstring",
    priority: 2,
  },
  {
    name: "Lying Leg Curl",
    target: ["hamstrings"],
    equipment: ["leg_curl"],
    difficulty: "beginner",
    cautions: [review("knee"), review("lower_back")],
    shapeGoal: ["leg_line"],
    startingWeight: LIGHTEST,
    workoutType: ["lower_body"],
    movementPattern: "hamstring",
    priority: 1,
  },
  {
    name: "Hip Abduction",
    target: ["glute_medius"],
    equipment: ["hip_abductor"],
    difficulty: "beginner",
    cautions: [review("hip")],
    shapeGoal: ["side_glutes"],
    startingWeight: LIGHTEST,
    workoutType: ["glutes", "lower_body"],
    movementPattern: "side_glute",
    priority: 1,
  },
  {
    name: "Cable Hip Abduction",
    target: ["glute_medius"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("hip")],
    shapeGoal: ["side_glutes"],
    startingWeight: wr(2.5, 5),
    workoutType: ["glutes"],
    movementPattern: "side_glute",
    priority: 2,
  },
  {
    name: "Cable Kickback",
    target: ["glutes"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("lower_back"), review("hip")],
    shapeGoal: ["glute_shape"],
    startingWeight: wr(2.5, 5),
    workoutType: ["glutes"],
    movementPattern: "isolation_finisher",
    priority: 1,
  },
  {
    name: "Band Side Walk",
    target: ["glute_medius"],
    equipment: ["resistance_band"],
    difficulty: "beginner",
    cautions: [review("knee"), review("hip")],
    shapeGoal: ["side_glutes"],
    startingWeight: LIGHT_BAND,
    workoutType: ["glutes"],
    movementPattern: "side_glute",
    priority: 3,
  },
  {
    name: "Curtsy Lunge",
    target: ["glutes", "quads"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    cautions: [exclude("knee"), review("hip")],
    shapeGoal: ["side_glutes", "leg_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["glutes", "lower_body"],
    movementPattern: "unilateral",
    priority: 5,
  },

  // --- Back / Pull ---
  {
    name: "Lat Pulldown",
    target: ["lats"],
    equipment: ["lat_pulldown"],
    difficulty: "beginner",
    cautions: [review("shoulder")],
    shapeGoal: ["back_line"],
    startingWeight: wr(10, 15),
    workoutType: ["upper_body", "back_shoulders", "full_body"],
    movementPattern: "vertical_pull",
    priority: 1,
  },
  {
    name: "Assisted Pull-Up",
    target: ["lats", "upper_back"],
    equipment: ["machine"],
    difficulty: "intermediate",
    cautions: [exclude("shoulder"), review("wrist")],
    shapeGoal: ["back_line"],
    startingWeight: HIGH_ASSIST,
    workoutType: ["upper_body", "back_shoulders"],
    movementPattern: "vertical_pull",
    priority: 4,
  },
  {
    name: "Single-Arm Lat Pulldown",
    target: ["lats"],
    equipment: ["cable"],
    difficulty: "intermediate",
    cautions: [review("shoulder")],
    shapeGoal: ["back_line"],
    startingWeight: wr(5, 7.5),
    workoutType: ["upper_body", "back_shoulders"],
    movementPattern: "vertical_pull",
    priority: 3,
  },
  {
    name: "Straight-Arm Pulldown",
    target: ["lats"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("shoulder")],
    shapeGoal: ["back_line"],
    startingWeight: wr(5, 10),
    workoutType: ["upper_body", "back_shoulders"],
    movementPattern: "vertical_pull",
    priority: 2,
  },
  {
    name: "Seated Cable Row",
    target: ["mid_back", "lats"],
    equipment: ["seated_row"],
    difficulty: "beginner",
    cautions: [review("lower_back"), review("shoulder")],
    shapeGoal: ["back_line"],
    startingWeight: wr(10, 15),
    workoutType: ["upper_body", "back_shoulders", "full_body"],
    movementPattern: "horizontal_pull",
    priority: 1,
  },
  {
    name: "One-Arm Dumbbell Row",
    target: ["lats", "mid_back"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [review("lower_back"), review("shoulder")],
    shapeGoal: ["back_line"],
    startingWeight: wr(4, 6),
    workoutType: ["upper_body", "back_shoulders"],
    movementPattern: "horizontal_pull",
    priority: 2,
  },
  {
    name: "Chest-Supported Row",
    target: ["mid_back", "upper_back"],
    equipment: ["dumbbell", "bench"],
    difficulty: "beginner",
    cautions: [review("shoulder")],
    shapeGoal: ["back_line"],
    startingWeight: wr(3, 5, true),
    workoutType: ["upper_body", "back_shoulders"],
    movementPattern: "horizontal_pull",
    priority: 3,
  },
  {
    name: "High Row",
    target: ["upper_back", "lats"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("shoulder")],
    shapeGoal: ["back_line"],
    startingWeight: LIGHTEST,
    workoutType: ["upper_body", "back_shoulders"],
    movementPattern: "horizontal_pull",
    priority: 4,
  },
  {
    name: "Face Pull",
    target: ["rear_delts", "upper_back"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("shoulder")],
    shapeGoal: ["back_line", "shoulder_line"],
    startingWeight: wr(5, 7.5),
    workoutType: ["back_shoulders"],
    movementPattern: "accessory",
    priority: 1,
  },

  // --- Shoulders ---
  {
    name: "Dumbbell Shoulder Press",
    target: ["shoulders"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [exclude("shoulder"), review("neck")],
    shapeGoal: ["shoulder_line"],
    startingWeight: wr(2, 4, true),
    workoutType: ["upper_body", "arms_shoulders", "full_body"],
    movementPattern: "shoulder_press",
    priority: 1,
  },
  {
    name: "Machine Shoulder Press",
    target: ["shoulders"],
    equipment: ["machine"],
    difficulty: "beginner",
    cautions: [exclude("shoulder"), review("neck")],
    shapeGoal: ["shoulder_line"],
    startingWeight: LIGHTEST,
    workoutType: ["arms_shoulders"],
    movementPattern: "shoulder_press",
    priority: 2,
  },
  {
    name: "Dumbbell Lateral Raise",
    target: ["side_delts"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [review("shoulder"), review("neck")],
    shapeGoal: ["shoulder_line"],
    startingWeight: wr(1, 2, true),
    workoutType: ["upper_body", "back_shoulders", "arms_shoulders", "full_body"],
    movementPattern: "side_delt",
    priority: 1,
  },
  {
    name: "Cable Lateral Raise",
    target: ["side_delts"],
    equipment: ["cable"],
    difficulty: "intermediate",
    cautions: [review("shoulder")],
    shapeGoal: ["shoulder_line"],
    startingWeight: wr(1, 2.5),
    workoutType: ["back_shoulders", "arms_shoulders"],
    movementPattern: "side_delt",
    priority: 2,
  },
  {
    name: "Rear Delt Fly",
    target: ["rear_delts"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [review("shoulder"), review("neck")],
    shapeGoal: ["shoulder_line", "back_line"],
    startingWeight: wr(1, 2, true),
    workoutType: ["back_shoulders", "arms_shoulders"],
    movementPattern: "rear_delt",
    priority: 2,
  },
  {
    name: "Reverse Pec Deck",
    target: ["rear_delts", "upper_back"],
    equipment: ["machine"],
    difficulty: "beginner",
    cautions: [review("shoulder")],
    shapeGoal: ["shoulder_line", "back_line"],
    startingWeight: LIGHTEST,
    workoutType: ["back_shoulders", "arms_shoulders"],
    movementPattern: "rear_delt",
    priority: 1,
  },

  // --- Chest ---
  {
    name: "Machine Chest Press",
    target: ["chest", "triceps"],
    equipment: ["machine"],
    difficulty: "beginner",
    cautions: [review("shoulder"), review("wrist")],
    shapeGoal: ["upper_body_line"],
    startingWeight: LIGHTEST,
    workoutType: ["upper_body"],
    movementPattern: "chest_optional",
    priority: 1,
  },
  {
    name: "Dumbbell Bench Press",
    target: ["chest", "triceps"],
    equipment: ["dumbbell", "bench"],
    difficulty: "intermediate",
    cautions: [exclude("shoulder"), review("wrist")],
    shapeGoal: ["upper_body_line"],
    startingWeight: wr(2, 4, true),
    workoutType: ["upper_body"],
    movementPattern: "chest_optional",
    priority: 2,
  },

  // --- Arms ---
  {
    name: "Dumbbell Biceps Curl",
    target: ["biceps"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [review("wrist"), review("elbow")],
    shapeGoal: ["arm_line"],
    startingWeight: wr(2, 3, true),
    workoutType: ["upper_body", "arms_shoulders"],
    movementPattern: "biceps",
    priority: 1,
  },
  {
    name: "Hammer Curl",
    target: ["biceps"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
    cautions: [review("elbow")],
    shapeGoal: ["arm_line"],
    startingWeight: wr(2, 4, true),
    workoutType: ["upper_body", "arms_shoulders"],
    movementPattern: "biceps",
    priority: 2,
  },
  {
    name: "Triceps Pushdown",
    target: ["triceps"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("elbow"), review("wrist")],
    shapeGoal: ["arm_line"],
    startingWeight: wr(5, 10),
    workoutType: ["upper_body", "arms_shoulders"],
    movementPattern: "triceps",
    priority: 1,
  },

  // --- Core & Waist ---
  {
    name: "Plank",
    target: ["core", "deep_core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("shoulder"), review("lower_back"), review("wrist")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "deep_core_stability",
    priority: 2,
  },
  {
    name: "Side Plank",
    target: ["obliques", "core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("shoulder"), review("lower_back")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "lateral_oblique",
    priority: 2,
  },
  {
    name: "Dead Bug",
    target: ["deep_core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("lower_back")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "deep_core_stability",
    priority: 1,
  },
  {
    name: "Bird Dog",
    target: ["deep_core", "core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("wrist"), review("lower_back")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "anti_rotation",
    priority: 2,
  },
  {
    name: "Crunch",
    target: ["abs"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("neck"), review("lower_back")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "flexion",
    priority: 2,
  },
  {
    name: "Side Crunch",
    target: ["obliques"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("neck"), review("lower_back")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "lateral_oblique",
    priority: 1,
  },
  {
    name: "Reverse Crunch",
    target: ["abs", "deep_core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    cautions: [review("lower_back")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "flexion",
    priority: 1,
  },
  {
    name: "Cable Crunch",
    target: ["abs"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("lower_back"), review("neck")],
    shapeGoal: ["waist_line"],
    startingWeight: wr(5, 10),
    workoutType: ["core_waist", "full_body"],
    movementPattern: "flexion",
    priority: 3,
  },
  {
    name: "Pallof Press",
    target: ["deep_core", "obliques"],
    equipment: ["cable"],
    difficulty: "beginner",
    cautions: [review("shoulder")],
    shapeGoal: ["waist_line"],
    startingWeight: wr(2.5, 5),
    workoutType: ["core_waist", "full_body"],
    movementPattern: "anti_rotation",
    priority: 1,
  },
  {
    name: "Hanging Knee Raise",
    target: ["abs", "hip_flexors"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    cautions: [exclude("shoulder"), review("lower_back")],
    shapeGoal: ["waist_line"],
    startingWeight: BODYWEIGHT,
    workoutType: ["core_waist", "full_body"],
    movementPattern: "flexion",
    priority: 4,
  },
];
