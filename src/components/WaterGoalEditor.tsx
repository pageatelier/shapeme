"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LabeledInput } from "@/components/my/SettingsPrimitives";
import { updateSettings } from "@/lib/settings/mutations";

/** Header + collapsible settings panel placed above HomeWaterCard — mirrors
 * the "오늘의 식단" section header's title+편집 row, but water's goal/cup
 * size need actual inputs (not just a link to /water), so this opens an
 * inline editor instead of navigating away. */
export function WaterGoalEditor({ waterGoalMl, cupMl }: { waterGoalMl: number; cupMl: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(String(waterGoalMl));
  const [cupInput, setCupInput] = useState(String(cupMl));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setGoalInput(String(waterGoalMl));
    setCupInput(String(cupMl));
    setError(null);
    setOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateSettings({
        waterGoalMl: Number(goalInput) || waterGoalMl,
        cupMl: Number(cupInput) || cupMl,
      });
      router.refresh();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[17px] leading-[1.4] font-bold tracking-[-0.025em] text-text-primary">
        오늘의 물
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-en text-[11px] font-semibold tracking-[0.03em] text-text-muted lowercase"
        >
          편집
        </button>
      </div>

      {open && (
        <div className="surface-card mb-3 flex flex-col gap-3 p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <LabeledInput label="하루 목표 용량" type="number" suffix="ml" value={goalInput} onChange={setGoalInput} />
            </div>
            <div className="flex-1">
              <LabeledInput label="한 컵 용량" type="number" suffix="ml" value={cupInput} onChange={setCupInput} />
            </div>
          </div>

          {error && <p className="text-[12px] text-error">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="min-h-[40px] flex-1 rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-text-secondary"
              style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
