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
  /** What was actually lifted/performed today, if logged — targetReps/
   * weightKg above are the plan, these are what happened. Null until the
   * user edits them (see ExerciseCard's actual-weight/reps fields). */
  actualWeightKg: number | null;
  actualReps: number | null;
};

export type WorkoutDifficulty = "too_light" | "just_right" | "too_hard";

export type WorkoutRoutine = {
  id: string;
  name: string;
  days: string[];
  orderIndex: number;
  exercises: WorkoutExercise[];
};

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
