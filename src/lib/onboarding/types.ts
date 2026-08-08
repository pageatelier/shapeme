import type { CountryCode, LanguageCode } from "@/lib/locale/region";

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

/** UI-enforced cap on step ④'s multi-select — "최대 2~3개 정도". */
export const MAX_FOCUS_AREAS = 3;

/** Step ③'s preset chips — users can also type a custom entry, which lands
 * in the same `bodyGoals` array as these labels (see OnboardingProfile). */
export const BODY_GOAL_PRESETS = [
  "탄탄하고 강한 몸",
  "슬림하고 선명한 라인",
  "볼륨 있고 탄탄한 라인",
  "자세와 균형 개선",
  "체력과 에너지 향상",
] as const;

export const CAUTION_PRESETS = [
  { value: "knee", label: "무릎" },
  { value: "lower_back", label: "허리" },
  { value: "shoulder", label: "어깨" },
  { value: "wrist", label: "손목" },
] as const;
export type CautionArea = (typeof CAUTION_PRESETS)[number]["value"];

export const WORKOUT_DAYS_OPTIONS = [2, 3, 4, 5] as const;
export type WorkoutDaysPerWeek = (typeof WORKOUT_DAYS_OPTIONS)[number];

export const SESSION_MINUTES_OPTIONS = [30, 45, 60] as const;
export type SessionMinutes = (typeof SESSION_MINUTES_OPTIONS)[number];

/**
 * Everything collected across onboarding steps ②–⑥, stored in the user's
 * auth metadata (see saveOnboardingProfile in mutations.ts) — no dedicated
 * table, same approach as Settings (settings/types.ts) and the existing
 * profile fields (profile/mutations.ts). `language`/`country` deliberately
 * reuse the exact metadata keys updateProfile() already writes, so the
 * onboarding step and /my/settings' 언어 및 지역 section always agree.
 */
export type OnboardingProfile = {
  language: LanguageCode;
  country: CountryCode;
  /** Preset labels (from BODY_GOAL_PRESETS) and freeform custom entries
   * mixed in the same array — a custom entry is just another string. */
  bodyGoals: string[];
  focusAreas: FocusArea[];
  daysPerWeek: WorkoutDaysPerWeek | null;
  place: WorkoutPlace | null;
  minutesPerSession: SessionMinutes | null;
  experience: ExperienceLevel | null;
  /** Preset caution keys plus any freeform entries, same mixed-array
   * approach as bodyGoals. Empty array means "없음" wasn't distinguished
   * from "not answered yet" — both read as "no cautions" downstream. */
  cautions: (CautionArea | string)[];
  avoidedExercisesNote: string;
  /** Gates the /onboarding redirect in (main)'s layout once true. */
  onboardingCompleted: boolean;
};

export const DEFAULT_ONBOARDING_PROFILE: OnboardingProfile = {
  language: "ko",
  country: "KR",
  bodyGoals: [],
  focusAreas: [],
  daysPerWeek: null,
  place: null,
  minutesPerSession: null,
  experience: null,
  cautions: [],
  avoidedExercisesNote: "",
  onboardingCompleted: false,
};

type RawMetadata = {
  language?: string;
  country?: string;
  body_goals?: string[];
  focus_areas?: string[];
  days_per_week?: number;
  workout_place?: string;
  minutes_per_session?: number;
  experience_level?: string;
  cautions?: string[];
  avoided_exercises_note?: string;
  onboarding_completed?: boolean;
};

/** Merges saved user_metadata fields over the defaults above — same pattern
 * as readSettings() in settings/types.ts. */
export function readOnboardingProfile(metadata: RawMetadata | null | undefined): OnboardingProfile {
  const m = metadata ?? {};
  return {
    language: (m.language as LanguageCode | undefined) ?? DEFAULT_ONBOARDING_PROFILE.language,
    country: (m.country as CountryCode | undefined) ?? DEFAULT_ONBOARDING_PROFILE.country,
    bodyGoals: m.body_goals ?? DEFAULT_ONBOARDING_PROFILE.bodyGoals,
    focusAreas: (m.focus_areas as FocusArea[] | undefined) ?? DEFAULT_ONBOARDING_PROFILE.focusAreas,
    daysPerWeek:
      (m.days_per_week as WorkoutDaysPerWeek | undefined) ?? DEFAULT_ONBOARDING_PROFILE.daysPerWeek,
    place: (m.workout_place as WorkoutPlace | undefined) ?? DEFAULT_ONBOARDING_PROFILE.place,
    minutesPerSession:
      (m.minutes_per_session as SessionMinutes | undefined) ?? DEFAULT_ONBOARDING_PROFILE.minutesPerSession,
    experience: (m.experience_level as ExperienceLevel | undefined) ?? DEFAULT_ONBOARDING_PROFILE.experience,
    cautions: m.cautions ?? DEFAULT_ONBOARDING_PROFILE.cautions,
    avoidedExercisesNote: m.avoided_exercises_note ?? DEFAULT_ONBOARDING_PROFILE.avoidedExercisesNote,
    onboardingCompleted: m.onboarding_completed ?? DEFAULT_ONBOARDING_PROFILE.onboardingCompleted,
  };
}
