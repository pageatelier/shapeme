"use client";

import { BrandLogo } from "@/components/BrandLogo";

/**
 * Step 0 of the flow — pure intro, no fields. Language/region aren't asked
 * up front: they're auto-detected into the draft instead (see
 * useOnboardingDraft's consumer in GuestIntroFlow) and stay editable later
 * from /my/settings.
 */
export function WelcomeStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <BrandLogo />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">
          Let&apos;s shape a plan around you.
        </h1>
        <p className="mx-auto max-w-[280px] text-[14px] leading-relaxed text-text-secondary">
          A few quick questions about your body, your routine, and how you like to move — then we&apos;ll put
          together your first week together.
        </p>
      </div>
      <p className="text-[12px] text-text-muted">Takes about 3 minutes. No account needed yet.</p>
    </div>
  );
}
