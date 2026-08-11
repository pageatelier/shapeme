import { GuestIntroFlow } from "@/components/onboarding/GuestIntroFlow";
import { readOnboardingProfile } from "@/lib/onboarding/types";
import { getCurrentUser } from "@/lib/supabase/server";

// Reached several ways: a guest lands here directly (nothing links to it
// yet, but proxy.ts's isOnboardingRoute exception makes it reachable
// pre-auth), signup redirects new users here directly ((auth)/signup/
// page.tsx), (main)/layout.tsx redirects any logged-in user — new or
// pre-existing — whose onboardingCompleted isn't set, and Supabase's email
// confirmation link redirects back here too (see AccountCreationStep's
// emailRedirectTo). This page itself lives outside (main), so it isn't
// caught by that same redirect.
//
// The guest-vs-resume-vs-legacy-flow decision can't be made here: whether
// there's an unfinished local draft to resume only exists in localStorage,
// which this server component can't read. GuestIntroFlow makes that call
// client-side — given a real user it either resumes the draft's tail
// (Account Creation onward) or falls through to the legacy OnboardingFlow
// itself; given no user it's the full guest-first flow from Welcome.
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) return <GuestIntroFlow />;

  const initialProfile = readOnboardingProfile(user.user_metadata);

  return <GuestIntroFlow authenticatedProfile={initialProfile} />;
}
