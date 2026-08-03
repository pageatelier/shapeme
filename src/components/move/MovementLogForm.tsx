"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMovementLog, saveMovementLog, updateMovementLog } from "@/lib/movement/mutations";
import { ACTIVITY_CONFIG } from "@/lib/movement/types";
import type { MovementActivityType, MovementLog } from "@/lib/movement/types";

function Field({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-text-muted">{label}</span>
      <input
        {...inputProps}
        className="min-h-[40px] rounded-[var(--radius-sm)] px-3 text-[13px] text-text-primary outline-none"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      />
    </label>
  );
}

export function MovementLogForm({
  date,
  activityType,
  log,
  onDone,
}: {
  date: string;
  activityType: MovementActivityType;
  log?: MovementLog;
  onDone: () => void;
}) {
  const router = useRouter();
  const config = ACTIVITY_CONFIG[activityType];
  const [duration, setDuration] = useState(log ? String(log.durationMinutes) : "");
  const [distanceKm, setDistanceKm] = useState(log?.distanceKm != null ? String(log.distanceKm) : "");
  const [steps, setSteps] = useState(log?.steps != null ? String(log.steps) : "");
  const [calories, setCalories] = useState(log?.calories != null ? String(log.calories) : "");
  const [memo, setMemo] = useState(log?.memo ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!duration.trim() || Number(duration) <= 0) {
      setError("운동 시간을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const input = {
        date,
        activityType,
        durationMinutes: Math.max(1, Number(duration) || 1),
        distanceKm: distanceKm.trim() ? Number(distanceKm) : null,
        steps: steps.trim() ? Number(steps) : null,
        calories: calories.trim() ? Number(calories) : null,
        memo: memo.trim() || null,
      };
      if (log) {
        await updateMovementLog(log.id, input);
      } else {
        await saveMovementLog(input);
      }
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!log) return;
    setSaving(true);
    setError(null);
    try {
      await deleteMovementLog(log.id);
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
      setSaving(false);
    }
  }

  return (
    <div className="glass-card flex flex-col gap-3 p-5">
      <p className="text-[13px] font-bold text-text-primary">
        {config.emoji} {config.label}
      </p>

      <Field
        label="운동 시간(분)"
        type="number"
        min={1}
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      {config.fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {config.fields.includes("distanceKm") && (
            <Field
              label="거리(km, 선택)"
              type="number"
              min={0}
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />
          )}
          {config.fields.includes("steps") && (
            <Field
              label="걸음 수(선택)"
              type="number"
              min={0}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          )}
          {config.fields.includes("calories") && (
            <Field
              label="칼로리(kcal, 선택)"
              type="number"
              min={0}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          )}
        </div>
      )}

      <Field label="메모(선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />

      {error && <p className="text-[12px] text-error">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="min-h-[40px] flex-1 rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={saving}
          className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          취소
        </button>
        {log && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-error"
            style={{ background: "var(--color-error-soft)" }}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
