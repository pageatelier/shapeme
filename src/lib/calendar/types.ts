import type { BodyEntry } from "@/lib/body/types";

export type CalendarStatus = "future" | "workout" | "recovery" | "partial" | "empty";

export type CalendarDay = {
  date: number;
  isoDate: string;
  isToday: boolean;
  challengeDay: number | null;
  status: CalendarStatus;
  completedSets: number;
  totalSets: number;
  routineName?: string | null;
  recoveryReason?: string | null;
  body?: BodyEntry;
  memo?: string;
};

export type MonthlyReport = {
  workoutDays: number;
  recoveryDays: number;
  bodyPhotoDays: number;
  completedSets: number;
};
