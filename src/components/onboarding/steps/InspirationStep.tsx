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
      <div>
        <p className="text-[13px] font-semibold text-text-secondary">A little visual direction</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text-primary">
          Which of these feels closest to your vibe?
        </h1>
        <p className="mt-1.5 text-[12px] text-text-muted">
          Just a starting point — your actual plan comes from what you tell us next.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INSPIRATION_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] transition-all"
              style={{
                outline: selected ? "2.5px solid var(--color-ink)" : "2.5px solid transparent",
                outlineOffset: "2px",
              }}
            >
              <Image
                src={opt.image}
                alt={opt.label}
                fill
                sizes="(max-width: 480px) 45vw, 220px"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(33,31,28,0) 55%, rgba(33,31,28,0.75) 100%)",
                }}
              />
              <p className="absolute bottom-2.5 left-3 text-[14px] font-bold text-white">{opt.label}</p>
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
    </div>
  );
}
