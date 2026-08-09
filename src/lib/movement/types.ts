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
export const ACTIVITY_CONFIG: Record<
  MovementActivityType,
  { label: string; emoji: string; fields: MovementField[] }
> = {
  running: { label: "Running", emoji: "🏃", fields: ["distanceKm", "calories"] },
  walking: { label: "Walking", emoji: "🚶", fields: ["steps"] },
  dance: { label: "Dance", emoji: "💃", fields: [] },
  yoga: { label: "Yoga", emoji: "🧘", fields: [] },
  pilates: { label: "Pilates", emoji: "🤸", fields: [] },
  stretching: { label: "Stretching", emoji: "🙆", fields: [] },
  cycling: { label: "Cycling", emoji: "🚴", fields: ["distanceKm"] },
  swimming: { label: "Swimming", emoji: "🏊", fields: ["distanceKm"] },
  other: { label: "Other", emoji: "✨", fields: [] },
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
