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
  running: { label: "러닝", emoji: "🏃", fields: ["distanceKm", "calories"] },
  walking: { label: "산책", emoji: "🚶", fields: ["steps"] },
  dance: { label: "댄스", emoji: "💃", fields: [] },
  yoga: { label: "요가", emoji: "🧘", fields: [] },
  pilates: { label: "필라테스", emoji: "🤸", fields: [] },
  stretching: { label: "스트레칭", emoji: "🙆", fields: [] },
  cycling: { label: "자전거", emoji: "🚴", fields: ["distanceKm"] },
  swimming: { label: "수영", emoji: "🏊", fields: ["distanceKm"] },
  other: { label: "기타", emoji: "✨", fields: [] },
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
