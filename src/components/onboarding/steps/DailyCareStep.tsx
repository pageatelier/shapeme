"use client";

import { ToggleRow } from "@/components/my/ToggleRow";
import { OnboardingPhotoHero } from "@/components/onboarding/OnboardingPhotoHero";
import type { DailyCarePreferences } from "@/lib/onboarding/draft";

const DAILY_CARE_OPTIONS: { key: keyof DailyCarePreferences; label: string; helper: string }[] = [
  { key: "waterTrackingEnabled", label: "Water tracking", helper: "Log how much you drink each day." },
  { key: "mealTrackingEnabled", label: "Meal tracking", helper: "Snap a quick photo of what you eat." },
  { key: "notificationsEnabled", label: "Reminders", helper: "A gentle nudge so movement doesn't slip your mind." },
  { key: "selfLoveMessageEnabled", label: "Self-love messages", helper: "A kind note waiting for you, some days." },
];

/** All 4 default to on (see DEFAULT_DAILY_CARE in draft.ts) — this step is
 * about letting a guest turn off what they don't want, not an empty slate. */
export function DailyCareStep({
  dailyCare,
  onChange,
}: {
  dailyCare: DailyCarePreferences;
  onChange: (patch: Partial<DailyCarePreferences>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingPhotoHero
        src="/onboading-images/rest.webp"
        eyebrow="Make it feel like yours"
        title="What should we help you keep up with?"
        subtitle="You can always change these later in Settings."
        objectPosition="center 20%"
      />

      <div className="flex flex-col gap-3">
        {DAILY_CARE_OPTIONS.map((opt) => (
          <div key={opt.key} className="glass-card px-1 py-1">
            <ToggleRow
              label={opt.label}
              on={dailyCare[opt.key]}
              onToggle={() => onChange({ [opt.key]: !dailyCare[opt.key] })}
            />
            <p className="px-4 pb-3 text-[11px] text-text-secondary">{opt.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
