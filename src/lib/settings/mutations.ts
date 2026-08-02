import { createClient } from "@/lib/supabase/client";
import type { Settings } from "./types";

/** Persists a partial settings patch into the user's auth metadata (merged, not replaced). */
export async function updateSettings(patch: Partial<Settings>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const data: Record<string, unknown> = {};
  if (patch.goalWeightKg !== undefined) data.goal_weight_kg = patch.goalWeightKg;
  if (patch.waterGoalMl !== undefined) data.water_goal_ml = patch.waterGoalMl;
  if (patch.weeklyWorkoutGoal !== undefined) data.weekly_workout_goal = patch.weeklyWorkoutGoal;
  if (patch.focusArea !== undefined) data.focus_area = patch.focusArea;
  if (patch.goalPeriod !== undefined) data.goal_period = patch.goalPeriod;
  if (patch.cupMl !== undefined) data.cup_ml = patch.cupMl;
  if (patch.weekStartDay !== undefined) data.week_start_day = patch.weekStartDay;
  if (patch.notificationTime !== undefined) data.notification_time = patch.notificationTime;
  if (patch.notificationsEnabled !== undefined) data.notifications_enabled = patch.notificationsEnabled;
  if (patch.selfLoveMessageEnabled !== undefined)
    data.self_love_message_enabled = patch.selfLoveMessageEnabled;
  if (patch.darkModeEnabled !== undefined) data.dark_mode_enabled = patch.darkModeEnabled;

  const { error } = await supabase.auth.updateUser({ data });
  if (error) throw error;
}
