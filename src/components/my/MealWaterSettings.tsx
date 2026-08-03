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
      <ToggleRow
        label="식단 기록 사용"
        on={mealEnabled}
        disabled={pending === "mealTrackingEnabled"}
        onToggle={() => toggle("mealTrackingEnabled", mealEnabled, setMealEnabled)}
      />
      <ToggleRow
        label="물 섭취 기록 사용"
        on={waterEnabled}
        disabled={pending === "waterTrackingEnabled"}
        onToggle={() => toggle("waterTrackingEnabled", waterEnabled, setWaterEnabled)}
      />
    </>
  );
}
