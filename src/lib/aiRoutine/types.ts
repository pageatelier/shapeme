/**
 * English weekday enum for this feature's own input/output and DB rows —
 * kept separate from the rest of the app's Korean day tokens
 * (workout_routines.days, src/lib/workout/types.ts's WEEKDAYS), which stay
 * untouched. WEEKDAY_EN_TO_KO below is the one conversion point where a
 * generated day gets written into that existing Korean-token system.
 */
export const WEEKDAYS_EN = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type WeekdayEn = (typeof WEEKDAYS_EN)[number];

export const WEEKDAY_EN_TO_KO: Record<WeekdayEn, string> = {
  monday: "월",
  tuesday: "화",
  wednesday: "수",
  thursday: "목",
  friday: "금",
  saturday: "토",
  sunday: "일",
};

export const WEEKDAY_LABEL_KO: Record<WeekdayEn, string> = {
  monday: "월요일",
  tuesday: "화요일",
  wednesday: "수요일",
  thursday: "목요일",
  friday: "금요일",
  saturday: "토요일",
  sunday: "일요일",
};

export type WorkoutPlace = "gym" | "home" | "both";
export type ExperienceLevel = "beginner" | "some" | "consistent";

export const FOCUS_AREA_OPTIONS = [
  { value: "glutes", label: "Glutes" },
  { value: "legs", label: "Legs" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full body" },
] as const;
export type FocusArea = (typeof FOCUS_AREA_OPTIONS)[number]["value"];

/** Named machines get their own tag instead of a shared generic "machine"
 * bucket, so equipment filtering in generateStartingWeek() can be specific
 * (e.g. a user with a leg press but no lat pulldown station shouldn't lose
 * both). A handful of exercises (Machine Chest Press, Machine Shoulder
 * Press, Reverse Pec Deck, Assisted Pull-Up, 45° Back Extension) don't map
 * to any of these named machines and keep the residual "machine" tag. */
export const EQUIPMENT_OPTIONS = [
  { value: "bodyweight", label: "맨몸" },
  { value: "dumbbell", label: "덤벨" },
  { value: "barbell", label: "바벨" },
  { value: "smith_machine", label: "스미스 머신" },
  { value: "cable", label: "케이블 머신" },
  { value: "bench", label: "벤치" },
  { value: "resistance_band", label: "저항 밴드" },
  { value: "kettlebell", label: "케틀벨" },
  { value: "leg_press", label: "레그 프레스" },
  { value: "leg_curl", label: "레그 컬" },
  { value: "leg_extension", label: "레그 익스텐션" },
  { value: "hip_abductor", label: "힙 어브덕터" },
  { value: "lat_pulldown", label: "랫 풀다운" },
  { value: "seated_row", label: "시티드 로우" },
  { value: "machine", label: "기타 머신" },
] as const;
export type Equipment = (typeof EQUIPMENT_OPTIONS)[number]["value"];

/** Conservative fallback when the user picks "잘 모르겠어요" instead of
 * listing equipment — common-denominator gear most gyms/homes have, per the
 * onboarding spec's own guidance for this case. */
export const UNSURE_EQUIPMENT_PRESET: Equipment[] = [
  "bodyweight",
  "dumbbell",
  "cable",
  "lat_pulldown",
  "leg_press",
  "leg_curl",
];

/** Everything the generator needs — collected from Guide's form (and, once
 * the onboarding retrofit lands, from onboarding too). */
export type RoutineGenerationInput = {
  workoutDays: WeekdayEn[]; // required, at least 1 — no "unset" fallback
  sessionMinutes: number;
  place: WorkoutPlace;
  goals: string[];
  focusAreas: FocusArea[];
  avoidAreas: string[]; // uncomfortable/cautioned body parts, free text allowed
  experience: ExperienceLevel;
  equipment: Equipment[];
};

export type WarmupItem = {
  name: string;
  /** e.g. "5회" or "30초" — mixed rep/duration units, kept as display text
   * rather than forcing every warmup move into one unit. */
  durationOrReps: string;
};

export type WorkoutItem = {
  name: string;
  targetMuscle: string;
  sets: number;
  reps: number;
  /** e.g. "가볍게 10kg" or "체감 강도 6/10" — intentionally a soft
   * suggestion, not a hard number, same framing as the onboarding
   * generator's "Suggested" copy. */
  suggestedIntensity: string;
  restSeconds: number;
};

export type CardioBlock = {
  /** "none" when the day has no separate cardio block. */
  type: string;
  minutes: number;
  intensity: string | null;
};

export type CooldownItem = {
  name: string;
  durationSeconds: number;
  targetArea: string;
};

export type AIRoutineDay = {
  day: WeekdayEn;
  title: string;
  estimatedMinutes: number;
  warmup: WarmupItem[];
  workout: WorkoutItem[];
  cardio: CardioBlock;
  cooldown: CooldownItem[];
};

export type AIRoutineWeek = {
  frequency: number;
  workoutDays: WeekdayEn[];
  days: AIRoutineDay[];
};
