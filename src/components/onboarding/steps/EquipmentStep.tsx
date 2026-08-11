"use client";

import { OnboardingPhotoHero } from "@/components/onboarding/OnboardingPhotoHero";
import { EQUIPMENT_OPTIONS, UNSURE_EQUIPMENT_PRESET } from "@/lib/aiRoutine/types";
import type { Equipment } from "@/lib/aiRoutine/types";

/** Gym vs. home grouping is purely presentational — both write into the
 * same flat `equipment: Equipment[]` the generator filters on. Dumbbells
 * live in the home group even though gyms have them too, to avoid
 * rendering (and needing to keep in sync) two buttons for one value. */
const GYM_EQUIPMENT: Equipment[] = [
  "barbell",
  "smith_machine",
  "cable",
  "leg_press",
  "leg_curl",
  "leg_extension",
  "hip_abductor",
  "lat_pulldown",
  "seated_row",
  "machine",
];
const HOME_EQUIPMENT: Equipment[] = ["dumbbell", "bench", "resistance_band", "kettlebell", "bodyweight"];

/** Split out of the old combined WorkoutLogisticsStep — its own screen so
 * My Week doesn't ask too many questions at once. */
export function EquipmentStep({
  equipment,
  onChange,
}: {
  equipment: Equipment[];
  onChange: (patch: { equipment: Equipment[] }) => void;
}) {
  function toggleEquipment(item: Equipment) {
    onChange({ equipment: equipment.includes(item) ? equipment.filter((e) => e !== item) : [...equipment, item] });
  }

  return (
    <div className="flex flex-col gap-6">
      <OnboardingPhotoHero
        src="/onboading-images/break.webp"
        eyebrow="So we pick moves you can actually do"
        title="What equipment can you use?"
        objectPosition="center 20%"
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-text-secondary">Optional — pick what you have access to</p>
          <button
            type="button"
            onClick={() => onChange({ equipment: UNSURE_EQUIPMENT_PRESET })}
            className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-pink-500"
            style={{ background: "var(--surface-card)" }}
          >
            I&apos;m not sure
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] text-text-muted">Gym</p>
          <div className="flex flex-wrap gap-2">
            {GYM_EQUIPMENT.map((value) => {
              const opt = EQUIPMENT_OPTIONS.find((o) => o.value === value)!;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleEquipment(value)}
                  className={`rounded-full px-4 py-2.5 text-[13px] ${
                    equipment.includes(value) ? "pill-selected" : "pill-unselected"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] text-text-muted">Home</p>
          <div className="flex flex-wrap gap-2">
            {HOME_EQUIPMENT.map((value) => {
              const opt = EQUIPMENT_OPTIONS.find((o) => o.value === value)!;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleEquipment(value)}
                  className={`rounded-full px-4 py-2.5 text-[13px] ${
                    equipment.includes(value) ? "pill-selected" : "pill-unselected"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
