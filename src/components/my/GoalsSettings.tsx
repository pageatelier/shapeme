"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSettings } from "@/lib/settings/mutations";
import type { Settings } from "@/lib/settings/types";
import { EditActions, LabeledInput, SettingsGroup, StaticRow } from "./SettingsPrimitives";

export function GoalsSettings({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goalWeight, setGoalWeight] = useState(settings.goalWeightKg != null ? String(settings.goalWeightKg) : "");
  const [waterGoal, setWaterGoal] = useState(String(settings.waterGoalMl));
  const [weeklyGoal, setWeeklyGoal] = useState(String(settings.weeklyWorkoutGoal));
  const [focusArea, setFocusArea] = useState(settings.focusArea);
  const [goalPeriod, setGoalPeriod] = useState(settings.goalPeriod);

  function cancel() {
    setGoalWeight(settings.goalWeightKg != null ? String(settings.goalWeightKg) : "");
    setWaterGoal(String(settings.waterGoalMl));
    setWeeklyGoal(String(settings.weeklyWorkoutGoal));
    setFocusArea(settings.focusArea);
    setGoalPeriod(settings.goalPeriod);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateSettings({
        goalWeightKg: goalWeight.trim() ? Number(goalWeight) : null,
        waterGoalMl: Number(waterGoal) || 0,
        weeklyWorkoutGoal: Number(weeklyGoal) || 0,
        focusArea,
        goalPeriod,
      });
      router.refresh();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[13px] font-bold text-text-secondary">나의 목표</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[11px] font-semibold text-text-muted"
          >
            편집
          </button>
        </div>
        <div className="surface-card divide-y" style={{ borderColor: "rgba(86,62,58,0.07)" }}>
          <StaticRow
            label="목표 체중 (선택)"
            value={settings.goalWeightKg ? `${settings.goalWeightKg}kg` : "설정 안 함"}
          />
          <StaticRow label="하루 물 섭취 목표" value={`${settings.waterGoalMl.toLocaleString()}ml`} />
          <StaticRow label="주간 운동 목표" value={`주 ${settings.weeklyWorkoutGoal}회`} />
          <StaticRow label="집중하고 싶은 부위" value={settings.focusArea || "설정 안 함"} />
          <StaticRow label="목표 기간" value={settings.goalPeriod || "설정 안 함"} />
        </div>
      </section>
    );
  }

  return (
    <SettingsGroup title="나의 목표 편집">
      <div className="flex flex-col gap-4 p-4">
        <LabeledInput label="목표 체중 (선택)" type="number" suffix="kg" value={goalWeight} onChange={setGoalWeight} />
        <LabeledInput label="하루 물 섭취 목표" type="number" suffix="ml" value={waterGoal} onChange={setWaterGoal} />
        <LabeledInput label="주간 운동 목표" type="number" suffix="회" value={weeklyGoal} onChange={setWeeklyGoal} />
        <LabeledInput label="집중하고 싶은 부위" value={focusArea} onChange={setFocusArea} />
        <LabeledInput label="목표 기간" value={goalPeriod} onChange={setGoalPeriod} />
        <EditActions saving={saving} error={error} onSave={save} onCancel={cancel} />
      </div>
    </SettingsGroup>
  );
}
