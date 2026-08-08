import { redirect } from "next/navigation";
import { WeeklyReviewView } from "@/components/my/WeeklyReviewView";
import { addDays, todayIsoDate } from "@/lib/body/date";
import { readOnboardingProfile } from "@/lib/onboarding/types";
import { generateWeeklyReview } from "@/lib/review/generateWeeklyReview";
import { getWeeklyReviewData } from "@/lib/review/queries";
import { getCurrentUser } from "@/lib/supabase/server";

// User-triggered from My page ("이번 주 리뷰 보기") — no cron, computed fresh
// on each visit from the last 7 days (today included) rather than a fixed
// Mon–Sun week, so "이번 주" always means "however I've been doing lately."
export default async function WeeklyReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const end = todayIsoDate();
  const start = addDays(end, -6);
  const profile = readOnboardingProfile(user.user_metadata);
  const days = await getWeeklyReviewData(user.id, start, end);
  const review = generateWeeklyReview(profile, days);

  return <WeeklyReviewView review={review} />;
}
