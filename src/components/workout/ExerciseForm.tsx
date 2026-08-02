"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  createExercise,
  deleteExercise,
  updateExercise,
  type ExerciseInput,
} from "@/lib/workout/mutations";
import type { WorkoutExercise } from "@/lib/workout/types";

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

export function ExerciseForm({
  routineId,
  orderIndex,
  exercise,
  onDone,
}: {
  routineId: string;
  orderIndex: number;
  exercise?: WorkoutExercise;
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(exercise?.name ?? "");
  const [targetSets, setTargetSets] = useState(String(exercise?.targetSets ?? 3));
  const [targetReps, setTargetReps] = useState(String(exercise?.targetReps ?? 10));
  const [weightKg, setWeightKg] = useState(exercise?.weightKg?.toString() ?? "");
  const [restSeconds, setRestSeconds] = useState(exercise?.restSeconds?.toString() ?? "");
  const [memo, setMemo] = useState(exercise?.memo ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("운동 이름을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const input: ExerciseInput = {
        routineId,
        name: name.trim(),
        targetSets: Math.max(1, Number(targetSets) || 1),
        targetReps: Math.max(1, Number(targetReps) || 1),
        weightKg: weightKg.trim() ? Number(weightKg) : null,
        restSeconds: restSeconds.trim() ? Number(restSeconds) : null,
        memo: memo.trim() || null,
        orderIndex,
      };
      if (exercise) {
        await updateExercise(exercise.id, input);
      } else {
        await createExercise(input);
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
    if (!exercise) return;
    setSaving(true);
    setError(null);
    try {
      await deleteExercise(exercise.id);
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field label="운동 이름" value={name} onChange={(e) => setName(e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="목표 세트"
          type="number"
          min={1}
          value={targetSets}
          onChange={(e) => setTargetSets(e.target.value)}
        />
        <Field
          label="목표 횟수"
          type="number"
          min={1}
          value={targetReps}
          onChange={(e) => setTargetReps(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="중량(kg, 선택)"
          type="number"
          min={0}
          step="0.5"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
        <Field
          label="휴식(초, 선택)"
          type="number"
          min={0}
          value={restSeconds}
          onChange={(e) => setRestSeconds(e.target.value)}
        />
      </div>
      <Field label="메모(선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />

      {error && <p className="text-[12px] text-error">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
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
        {exercise && (
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
    </form>
  );
}
