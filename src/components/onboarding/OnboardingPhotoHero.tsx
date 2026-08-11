"use client";

import Image from "next/image";

/**
 * Full-bleed photo treatment for onboarding steps that want it ("Pattern
 * A") — the same fixed-viewport-image + gradient-scrim approach as the
 * login/signup pages, sized to a hero band at the top instead of the whole
 * viewport, since these screens have live interactive content below (not
 * just a bottom-anchored card). `position: fixed` escapes (onboarding)
 * layout's padding/max-width wrapper the same way it does on login — no
 * ancestor here sets transform/filter/will-change/contain either. The
 * gradient reaches var(--color-bg) by the band's bottom edge, so it matches
 * whatever .app-shell renders behind the content that follows — dark mode
 * included, since --color-bg is themed there too.
 *
 * Renders its own eyebrow/title/subtitle in light text over the photo.
 * Step-specific interactive content (pills, etc.) is meant to follow as a
 * sibling in the step component, not a child here, so it flows normally
 * past the hero band once the gradient has faded to solid ground.
 */
export function OnboardingPhotoHero({
  src,
  eyebrow,
  title,
  subtitle,
  objectPosition = "center 25%",
}: {
  src: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  objectPosition?: string;
}) {
  return (
    <>
      <div className="pointer-events-none fixed top-0 left-1/2 z-[-1] h-[48vh] w-full max-w-[var(--container-sm)] -translate-x-1/2">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
          style={{ objectPosition }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(33,31,28,0.05) 0%, rgba(33,31,28,0.4) 42%, rgba(33,31,28,0.8) 75%, var(--color-bg) 100%)",
          }}
        />
      </div>
      <div className="flex min-h-[28vh] flex-col justify-end gap-1.5 pb-6">
        <p className="text-[13px] font-semibold text-white/80">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-white">{title}</h1>
        {subtitle && <p className="text-[12px] leading-relaxed text-white/75">{subtitle}</p>}
      </div>
    </>
  );
}
