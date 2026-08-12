"use client";

import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";

/**
 * Step 0 of the flow — pure intro, no fields. Language/region aren't asked
 * up front: they're auto-detected into the draft instead (see
 * useOnboardingDraft's consumer in GuestIntroFlow) and stay editable later
 * from /my/settings.
 *
 * Bespoke full-bleed treatment (not OnboardingPhotoHero) since this is the
 * one screen with login/signup's exact low-content shape — logo, headline,
 * subtext — rather than a title sitting above interactive content. Same
 * fixed-image + gradient pattern as those pages, just with welcome.webp and
 * BrandLogo's light variant instead of the auth card.
 */
export function WelcomeStep() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      {/* top-0 + explicit height: 100dvh instead of inset-0 — see
          LoginForm.tsx's identical wrapper for why (iOS Safari's dynamic
          toolbar can otherwise leave a gap of the page's own background
          showing above/below the photo). */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 z-[-1] w-full max-w-[var(--container-sm)] -translate-x-1/2"
        style={{ height: "100dvh" }}
      >
        <Image
          src="/onboading-images/welcome.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(33,31,28,0.1) 0%, rgba(33,31,28,0.55) 55%, rgba(33,31,28,0.88) 100%)",
          }}
        />
      </div>

      <BrandLogo light />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-white">Let&apos;s shape a plan around you.</h1>
        <p className="mx-auto max-w-[280px] text-[14px] leading-relaxed text-white/80">
          A few quick questions about your body, your routine, and how you like to move — then we&apos;ll put
          together your first week together.
        </p>
      </div>
      <p className="text-[12px] text-white/70">Takes about 3 minutes. No account needed yet.</p>
    </div>
  );
}
