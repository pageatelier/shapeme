import { generateStartingWeek } from "@/lib/onboarding/generateStartingWeek";
import type { StartingWeekDay } from "@/lib/onboarding/generateStartingWeek";
import type { ExperienceLevel, OnboardingProfile } from "@/lib/onboarding/types";
import type { WeeklyReviewDay } from "./queries";

export type WeeklyReview = {
  summary: string;
  wentWell: string[];
  toAdjust: string[];
  nextWeek: StartingWeekDay[];
};

const EXPERIENCE_LEVELS: ExperienceLevel[] = ["beginner", "some", "consistent"];

/** One level lighter/heavier for next week's *suggested weight* scaling
 * only — never rewrites the user's own self-reported experience answer. */
function shiftExperience(current: ExperienceLevel, direction: -1 | 1): ExperienceLevel {
  const idx = EXPERIENCE_LEVELS.indexOf(current);
  return EXPERIENCE_LEVELS[Math.min(EXPERIENCE_LEVELS.length - 1, Math.max(0, idx + direction))];
}

/** Majority difficulty among days that actually got answered — null if
 * nothing was answered, or if "just_right"/mixed answers don't have a
 * clear majority either way. */
function dominantDifficulty(days: WeeklyReviewDay[]): "too_light" | "too_hard" | null {
  const answered = days.map((d) => d.difficulty).filter((d): d is string => !!d);
  if (answered.length === 0) return null;
  const tooHard = answered.filter((d) => d === "too_hard").length;
  const tooLight = answered.filter((d) => d === "too_light").length;
  if (tooHard > answered.length / 2) return "too_hard";
  if (tooLight > answered.length / 2) return "too_light";
  return null;
}

/**
 * Deterministic stand-in for Phase 6's real AI call (same OpenAI billing
 * block as generateStartingWeek). Looks at the past week's frozen targets
 * (daily_move_snapshots), what was actually done (workout_set_logs),
 * difficulty feedback, and meal logging, and produces a short review plus
 * next week's routine — reusing generateStartingWeek with the profile's
 * experience nudged up/down based on this week's difficulty feedback.
 */
export function generateWeeklyReview(profile: OnboardingProfile, days: WeeklyReviewDay[]): WeeklyReview {
  const totalTarget = days.reduce((sum, d) => sum + d.totalTargetSets, 0);
  const totalDone = days.reduce((sum, d) => sum + d.doneSets, 0);
  const completionRate = totalTarget > 0 ? totalDone / totalTarget : 0;
  const activeDays = days.filter((d) => d.totalTargetSets > 0 || d.doneSets > 0).length;
  const mealDays = days.filter((d) => d.hasMeal).length;
  const difficulty = dominantDifficulty(days);

  const wentWell: string[] = [];
  const toAdjust: string[] = [];

  if (completionRate >= 0.8) {
    wentWell.push(`이번 주 루틴을 ${Math.round(completionRate * 100)}% 완료했어요. 꾸준함이 정말 좋아요.`);
  } else if (totalDone > 0) {
    wentWell.push("완벽하지 않아도 몸을 움직인 날들이 있었어요. 그것만으로도 충분해요.");
  } else if (activeDays > 0) {
    wentWell.push("이번 주도 나를 위한 시간을 계획해뒀어요.");
  } else {
    wentWell.push("다시 시작하는 이번 한 걸음도 의미 있어요.");
  }

  if (mealDays >= 4) {
    wentWell.push(`식단도 ${mealDays}일 기록했어요 — 몸에 관심을 기울이고 있다는 증거예요.`);
  }

  if (totalTarget > 0 && completionRate < 0.5) {
    toAdjust.push("이번 주는 완료율이 낮았어요. 다음 주는 목표 세트 수를 살짝 줄여서 부담을 덜어볼게요.");
  }
  if (difficulty === "too_hard") {
    toAdjust.push("운동이 부담스러웠던 날이 많았어요. 다음 주는 무게를 살짝 낮춰서 편하게 조절해볼게요.");
  } else if (difficulty === "too_light") {
    toAdjust.push("생각보다 여유가 있으셨네요. 다음 주는 강도를 조금 올려볼게요.");
  }
  if (mealDays < 3) {
    toAdjust.push("식단 기록이 뜸했어요. 부담 없이 한 끼라도 남겨보면 좋아요.");
  }
  if (toAdjust.length === 0) {
    toAdjust.push("지금 페이스가 잘 맞아요. 다음 주도 같은 흐름으로 가볼게요.");
  }

  const summary =
    totalTarget > 0
      ? `이번 주는 ${totalDone}/${totalTarget}세트(${Math.round(completionRate * 100)}%)를 완료했어요.`
      : "이번 주는 예정된 루틴이 없었어요.";

  const nextWeekExperience = profile.experience
    ? difficulty === "too_hard"
      ? shiftExperience(profile.experience, -1)
      : difficulty === "too_light"
        ? shiftExperience(profile.experience, 1)
        : profile.experience
    : profile.experience;

  const nextWeek = generateStartingWeek({ ...profile, experience: nextWeekExperience });

  return { summary, wentWell, toAdjust, nextWeek };
}
