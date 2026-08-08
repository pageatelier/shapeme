import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { readOnboardingProfile } from "@/lib/onboarding/types";
import { getCurrentUser } from "@/lib/supabase/server";

// Reached two ways: signup redirects new users here directly ((auth)/signup/
// page.tsx), and (main)/layout.tsx redirects any logged-in user — new or
// pre-existing — whose onboardingCompleted isn't set. This page itself
// lives outside (main), so it isn't caught by that same redirect.
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const initialProfile = readOnboardingProfile(user.user_metadata);

  return <OnboardingFlow initialProfile={initialProfile} />;
}
