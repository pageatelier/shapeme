export type WorkoutExercise = {
  id: string;
  routineId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  weightKg: number | null;
  restSeconds: number | null;
  memo: string | null;
  orderIndex: number;
  /** This day's set-completion, padded/truncated to targetSets length. */
  sets: boolean[];
};

export type WorkoutRoutine = {
  id: string;
  name: string;
  days: string[];
  orderIndex: number;
  exercises: WorkoutExercise[];
};

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
