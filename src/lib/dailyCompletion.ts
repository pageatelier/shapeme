/**
 * One day's overall completion %, averaged across the four tracked
 * categories. Used by both Home (today) and Calendar (every day of the
 * month) so the number means the same thing in both places.
 */
export function dayCompletionPercent({
  workoutPct,
  waterPct,
  mealPct,
  bodyPct,
}: {
  workoutPct: number;
  waterPct: number;
  mealPct: number;
  bodyPct: number;
}): number {
  return Math.round((workoutPct + waterPct + mealPct + bodyPct) / 4);
}
