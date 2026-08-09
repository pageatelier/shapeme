export type WeekStartDay = "sun" | "mon";

export type Settings = {
  goalWeightKg: number | null;
  waterGoalMl: number;
  weeklyWorkoutGoal: number;
  focusArea: string;
  goalPeriod: string;
  cupMl: number;
  weekStartDay: WeekStartDay;
  notificationTime: string | null;
  notificationsEnabled: boolean;
  selfLoveMessageEnabled: boolean;
  darkModeEnabled: boolean;
  mealTrackingEnabled: boolean;
  waterTrackingEnabled: boolean;
  /** ISO timestamp of when the user started their current goalPeriod
   * program — stamped once, when onboarding completes. Null for anyone who
   * hasn't (re)started a program since this field shipped; callers computing
   * journey progress fall back to the Supabase Auth user's own created_at. */
  programStartedAt: string | null;
};

export const DEFAULT_SETTINGS: Settings = {
  goalWeightKg: null,
  waterGoalMl: 2000,
  weeklyWorkoutGoal: 4,
  focusArea: "하체 · 코어",
  goalPeriod: "12주",
  cupMl: 250,
  weekStartDay: "sun",
  notificationTime: null,
  notificationsEnabled: true,
  selfLoveMessageEnabled: true,
  darkModeEnabled: false,
  mealTrackingEnabled: false,
  waterTrackingEnabled: false,
  programStartedAt: null,
};

type RawMetadata = {
  goal_weight_kg?: number | null;
  water_goal_ml?: number;
  weekly_workout_goal?: number;
  focus_area?: string;
  goal_period?: string;
  cup_ml?: number;
  week_start_day?: WeekStartDay;
  notification_time?: string | null;
  notifications_enabled?: boolean;
  self_love_message_enabled?: boolean;
  dark_mode_enabled?: boolean;
  meal_tracking_enabled?: boolean;
  water_tracking_enabled?: boolean;
  program_started_at?: string | null;
};

/** Merges saved user_metadata fields over the defaults above. */
export function readSettings(metadata: RawMetadata | null | undefined): Settings {
  const m = metadata ?? {};
  return {
    goalWeightKg: m.goal_weight_kg ?? DEFAULT_SETTINGS.goalWeightKg,
    waterGoalMl: m.water_goal_ml ?? DEFAULT_SETTINGS.waterGoalMl,
    weeklyWorkoutGoal: m.weekly_workout_goal ?? DEFAULT_SETTINGS.weeklyWorkoutGoal,
    focusArea: m.focus_area ?? DEFAULT_SETTINGS.focusArea,
    goalPeriod: m.goal_period ?? DEFAULT_SETTINGS.goalPeriod,
    cupMl: m.cup_ml ?? DEFAULT_SETTINGS.cupMl,
    weekStartDay: m.week_start_day ?? DEFAULT_SETTINGS.weekStartDay,
    notificationTime: m.notification_time ?? DEFAULT_SETTINGS.notificationTime,
    notificationsEnabled: m.notifications_enabled ?? DEFAULT_SETTINGS.notificationsEnabled,
    selfLoveMessageEnabled: m.self_love_message_enabled ?? DEFAULT_SETTINGS.selfLoveMessageEnabled,
    darkModeEnabled: m.dark_mode_enabled ?? DEFAULT_SETTINGS.darkModeEnabled,
    mealTrackingEnabled: m.meal_tracking_enabled ?? DEFAULT_SETTINGS.mealTrackingEnabled,
    waterTrackingEnabled: m.water_tracking_enabled ?? DEFAULT_SETTINGS.waterTrackingEnabled,
    programStartedAt: m.program_started_at ?? DEFAULT_SETTINGS.programStartedAt,
  };
}
