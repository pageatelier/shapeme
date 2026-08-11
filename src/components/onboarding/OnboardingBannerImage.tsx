"use client";

import Image from "next/image";

/**
 * Smaller, non-fixed photo treatment ("Pattern B") for steps whose own
 * content is too long/dense for a persistent full-bleed background —
 * StartingWeekReview's exercise list and Body Check-in's capture UI. Just a
 * rounded banner that scrolls with the page, no gradient/text overlay
 * needed since it doesn't have to host copy the way OnboardingPhotoHero
 * does.
 */
export function OnboardingBannerImage({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-[var(--radius-xl)]">
      <Image src={src} alt={alt} fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
    </div>
  );
}
