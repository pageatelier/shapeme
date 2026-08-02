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
  };
}
