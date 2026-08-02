import type { BodyEntry } from "@/lib/body/types";

export type CalendarDay = {
  date: number; // day of month, 1-31
  isoDate: string;
  isToday: boolean;
  completionRate: number | null; // null for future days
  workoutDone: boolean;
  waterDone: boolean;
  mealDone: boolean;
  body?: BodyEntry;
  memo?: string;
};

export type MonthlyReport = {
  avgCompletion: number;
  workoutDays: number;
  waterGoalDays: number;
  mealLogDays: number;
  bodyPhotoDays: number;
  bestStreakDay: string | null;
};
