export type MovementActivityType =
  | "running"
  | "walking"
  | "dance"
  | "yoga"
  | "pilates"
  | "stretching"
  | "cycling"
  | "swimming"
  | "other";

export type MovementField = "distanceKm" | "steps" | "calories";

/** Adding a new movement type is just one more entry here — no migration
 * needed, since movement_logs.activity_type has no check constraint. */
export const ACTIVITY_CONFIG: Record<MovementActivityType, { label: string; fields: MovementField[] }> = {
  running: { label: "Running", fields: ["distanceKm", "calories"] },
  walking: { label: "Walking", fields: ["steps"] },
  dance: { label: "Dance", fields: [] },
  yoga: { label: "Yoga", fields: [] },
  pilates: { label: "Pilates", fields: [] },
  stretching: { label: "Stretching", fields: [] },
  cycling: { label: "Cycling", fields: ["distanceKm"] },
  swimming: { label: "Swimming", fields: ["distanceKm"] },
  other: { label: "Other", fields: [] },
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_CONFIG) as MovementActivityType[];

export type MovementLog = {
  id: string;
  date: string;
  activityType: MovementActivityType;
  durationMinutes: number;
  distanceKm: number | null;
  steps: number | null;
  calories: number | null;
  memo: string | null;
};
