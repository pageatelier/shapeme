"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSettings } from "@/lib/settings/mutations";
import type { Settings } from "@/lib/settings/types";
import { ToggleRow } from "./ToggleRow";

/** Meal/water tracking are hidden from the MVP's Today by default — these
 * two toggles bring the existing (untouched) HomeMealGrid/HomeWaterCard
 * sections back for users who want them, without changing the default. */
export function MealWaterSettings({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, setPending] = useState<keyof Settings | null>(null);
  const [mealEnabled, setMealEnabled] = useState(settings.mealTrackingEnabled);
  const [waterEnabled, setWaterEnabled] = useState(settings.waterTrackingEnabled);

  async function toggle(
    key: "mealTrackingEnabled" | "waterTrackingEnabled",
    current: boolean,
    setLocal: (v: boolean) => void,
  ) {
    const next = !current;
    setLocal(next);
    setPending(key);
    try {
      await updateSettings({ [key]: next });
      router.refresh();
    } catch {
      setLocal(current);
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <div>
        <ToggleRow
          label="Meal tracking"
          on={mealEnabled}
          disabled={pending === "mealTrackingEnabled"}
          onToggle={() => toggle("mealTrackingEnabled", mealEnabled, setMealEnabled)}
        />
        <p className="px-4 pb-3 text-[11px] text-text-secondary">Show meals on Today.</p>
      </div>
      <div>
        <ToggleRow
          label="Water tracking"
          on={waterEnabled}
          disabled={pending === "waterTrackingEnabled"}
          onToggle={() => toggle("waterTrackingEnabled", waterEnabled, setWaterEnabled)}
        />
        <p className="px-4 pb-3 text-[11px] text-text-secondary">Show water on Today.</p>
      </div>
    </>
  );
}
