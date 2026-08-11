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
// Whether there's an unfinished local draft to resume only exists in
// localStorage, which this server component can't read — GuestIntroFlow
// makes that call client-side, resuming from draft.stage when there's
// something to resume and starting fresh at Welcome otherwise (skipping
// Account Creation if a session already exists, e.g. an authenticated
// account with incomplete onboarding walking this flow for the first time).
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) return <GuestIntroFlow />;

  const initialProfile = readOnboardingProfile(user.user_metadata);

  return <GuestIntroFlow authenticatedProfile={initialProfile} />;
}
