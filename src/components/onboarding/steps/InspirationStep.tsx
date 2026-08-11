"use client";

import Image from "next/image";
import { CheckIcon } from "@/components/icons";
import type { Inspiration } from "@/lib/onboarding/generateStartingWeek";

const INSPIRATION_OPTIONS: { value: Inspiration; label: string; image: string }[] = [
  { value: "slim", label: "Slim", image: "/body-inspiration/slim.webp" },
  { value: "toned", label: "Toned", image: "/body-inspiration/toned.webp" },
  { value: "curvy", label: "Curvy", image: "/body-inspiration/curvy.webp" },
  { value: "strong", label: "Strong", image: "/body-inspiration/strong.webp" },
];

/**
 * Step 1 of the guest-first flow — visual direction only, not a routine
 * driver. Focus Areas (later in the flow) stays the primary shape input to
 * generateStartingWeek(); this only feeds its tie-break path (see
 * INSPIRATION_SHAPE_GOALS in generateStartingWeek.ts) when a slot is
 * otherwise a coin flip. Framed in copy as a vibe check, not a promise.
 *
 * Moodboard layout: the 4 reference photos tile edge-to-edge as a full-bleed
 * 2x2 grid (breaking out of the layout's side padding via negative margin —
 * this block isn't `fixed` like OnboardingPhotoHero, it just bleeds
 * horizontally and scrolls normally), with a floating dark panel centered
 * over the seam holding the question and the 4 selection pills. Pills stay
 * in the same top-left/top-right/bottom-left/bottom-right order as the
 * photos behind them so the spatial mapping is obvious without needing a
 * label on every tile.
 */
export function InspirationStep({
  value,
  onChange,
}: {
  value: Inspiration | null;
  onChange: (inspiration: Inspiration) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative -mx-5 aspect-[3/4] w-[calc(100%+2.5rem)] overflow-hidden">
        <div className="grid h-full w-full grid-cols-2 grid-rows-2">
          {INSPIRATION_OPTIONS.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className="relative overflow-hidden"
                aria-label={opt.label}
              >
                <Image
                  src={opt.image}
                  alt={opt.label}
                  fill
                  sizes="50vw"
                  className="object-cover"
                  style={{ filter: selected ? "none" : value ? "grayscale(0.15) brightness(0.85)" : "none" }}
                />
                {selected && (
                  <div
                    className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ background: "var(--color-ink)" }}
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div
            className="pointer-events-auto flex w-[56%] min-w-[180px] flex-col gap-2.5 rounded-[var(--radius-md)] p-3 text-center"
            style={{ background: "rgba(33, 31, 28, 0.92)", boxShadow: "var(--shadow-floating)" }}
          >
            <div>
              <p className="text-[9px] font-semibold text-white/65">A little visual direction</p>
              <h1 className="mt-0.5 text-[13px] leading-snug font-bold tracking-[-0.01em] text-white">
                Which feels closest to your vibe?
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {INSPIRATION_OPTIONS.map((opt) => {
                const selected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`rounded-full px-2 py-1.5 text-[11px] ${selected ? "pill-selected" : "pill-unselected"}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[12px] text-text-muted">
        Just a starting point — your actual plan comes from what you tell us next.
      </p>
    </div>
  );
}
