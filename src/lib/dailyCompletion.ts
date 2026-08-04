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

/**
 * "오늘의 루틴" % — Move/식단/물만(Body/Journal은 별도), Move가 기본 100%를
 * 갖고 식단·물 트래킹이 켜져 있을 때만 각각 10%씩 나눠 갖는다. Today 페이지의
 * 오늘 카드와, My의 월간 캘린더/날짜별 상세가 모두 이 함수로 계산해 같은 날에
 * 대해 항상 같은 숫자를 보여준다.
 */
export function routineCompletionPercent({
  movePercent,
  mealDoneToday,
  waterPct,
  mealTrackingEnabled,
  waterTrackingEnabled,
}: {
  movePercent: number;
  mealDoneToday: boolean;
  waterPct: number;
  mealTrackingEnabled: boolean;
  waterTrackingEnabled: boolean;
}): number {
  let moveWeight = 100;
  let mealWeight = 0;
  let waterWeight = 0;
  if (mealTrackingEnabled && waterTrackingEnabled) {
    moveWeight = 80;
    mealWeight = 10;
    waterWeight = 10;
  } else if (mealTrackingEnabled) {
    moveWeight = 90;
    mealWeight = 10;
  } else if (waterTrackingEnabled) {
    moveWeight = 90;
    waterWeight = 10;
  }

  return Math.round(
    moveWeight * (movePercent / 100) + mealWeight * (mealDoneToday ? 1 : 0) + waterWeight * (waterPct / 100),
  );
}

/** Move % for one day: strength routine's done/target sets if any target
 * exists, otherwise 100 if there's at least one simple movement log, else 0.
 * Shared by Today, and My's calendar/detail so "무엇을 Move로 치는지"가 같다. */
export function movePercentFor({
  workoutDoneSets,
  workoutTotalSets,
  hasMovementLog,
}: {
  workoutDoneSets: number;
  workoutTotalSets: number;
  hasMovementLog: boolean;
}): number {
  if (workoutTotalSets > 0) return (workoutDoneSets / workoutTotalSets) * 100;
  return hasMovementLog ? 100 : 0;
}
