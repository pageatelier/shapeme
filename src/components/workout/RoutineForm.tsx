"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createRoutine, deleteRoutine, updateRoutine } from "@/lib/workout/mutations";
import { WEEKDAYS } from "@/lib/workout/types";
import type { WorkoutRoutine } from "@/lib/workout/types";

export function RoutineForm({
  orderIndex,
  routine,
  onDone,
}: {
  orderIndex: number;
  routine?: WorkoutRoutine;
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(routine?.name ?? "");
  const [days, setDays] = useState<string[]>(routine?.days ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: string) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("루틴 이름을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (routine) {
        await updateRoutine(routine.id, { name: name.trim(), days });
      } else {
        await createRoutine({ name: name.trim(), days, orderIndex });
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
    if (!routine) return;
    setSaving(true);
    setError(null);
    try {
      await deleteRoutine(routine.id);
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-3 p-5">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-text-muted">루틴 이름</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 하체 운동"
          className="min-h-[40px] rounded-[var(--radius-sm)] px-3 text-[13px] text-text-primary outline-none"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
      </label>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold text-text-muted">수행 요일</span>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => {
            const active = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className="h-8 w-8 rounded-full text-[12px] font-semibold"
                style={
                  active
                    ? { background: "var(--gradient-primary)", color: "var(--color-text-inverse)" }
                    : { background: "var(--surface-card)", color: "var(--color-text-secondary)", border: "var(--border-soft)" }
                }
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

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
        {routine && (
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
