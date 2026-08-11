import { GuestIntroFlow } from "@/components/onboarding/GuestIntroFlow";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { readOnboardingProfile } from "@/lib/onboarding/types";
import { getCurrentUser } from "@/lib/supabase/server";

// Reached three ways: a guest lands here directly (nothing links to it yet,
// but proxy.ts's isOnboardingRoute exception makes it reachable pre-auth —
// see the onboarding-rewrite plan's Phase 3), signup redirects new users
// here directly ((auth)/signup/page.tsx), and (main)/layout.tsx redirects
// any logged-in user — new or pre-existing — whose onboardingCompleted
// isn't set. This page itself lives outside (main), so it isn't caught by
// that same redirect.
//
// Guests get the new guest-first flow's first 3 steps (Welcome/Inspiration/
// Routine Preference, Phase 4) — everything past that still only exists
// inside the legacy, login-gated OnboardingFlow below, which an
// authenticated user reaches unchanged. Rewiring Path A onto the guest
// draft (so a guest can walk the whole thing without hitting this branch)
// is Phase 5.
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) return <GuestIntroFlow />;

  const initialProfile = readOnboardingProfile(user.user_metadata);

  return <OnboardingFlow initialProfile={initialProfile} />;
}
