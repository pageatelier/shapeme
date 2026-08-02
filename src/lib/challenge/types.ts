export type ChallengeGoal = "glutes" | "full-body" | "upper-body" | "strength";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type WorkoutLocation = "gym" | "home" | "both";
export type ChallengeStatus = "active" | "completed" | "archived";
export type ChallengeDayStatus = "workout" | "recovery";
export type WorkoutEffort = "easy" | "good" | "hard";

export type Challenge = {
  id: string;
  goal: ChallengeGoal;
  heightCm: number | null;
  startWeightKg: number | null;
  experienceLevel: ExperienceLevel;
  workoutDaysPerWeek: number;
  sessionMinutes: number;
  workoutLocation: WorkoutLocation;
  equipment: string[];
  limitations: string | null;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
};

export type ChallengeDayLog = {
  id: string;
  challengeId: string;
  logDate: string;
  status: ChallengeDayStatus;
  routineId: string | null;
  routineName: string | null;
  recoveryReason: string | null;
  effort: WorkoutEffort | null;
  pain: boolean;
  completedSets: number;
  totalSets: number;
};

export type ChallengeSetupInput = {
  goal: ChallengeGoal;
  heightCm: number;
  startWeightKg: number;
  experienceLevel: ExperienceLevel;
  workoutDaysPerWeek: number;
  sessionMinutes: number;
  workoutLocation: WorkoutLocation;
  equipment: string[];
  limitations: string;
};

export const GOAL_LABELS: Record<ChallengeGoal, string> = {
  glutes: "힙업·하체 라인",
  "full-body": "탄탄한 전신",
  "upper-body": "등·상체 라인",
  strength: "근력 향상",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "운동을 막 시작했어요",
  intermediate: "6개월 이상 해봤어요",
  advanced: "1년 이상 꾸준히 했어요",
};

export const RECOVERY_REASON_LABELS: Record<string, string> = {
  period: "생리로 불편해요",
  sick: "몸이 아파요",
  pain: "통증이 있어요",
  fatigue: "피로가 심해요",
  schedule: "일정이 어려워요",
  other: "기타",
};
