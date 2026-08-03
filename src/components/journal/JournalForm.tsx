"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveJournalEntry } from "@/lib/journal/mutations";
import { MOOD_OPTIONS } from "@/lib/journal/types";
import type { Mood } from "@/lib/journal/types";

export function JournalForm({
  date,
  initialMood,
  initialDayText,
  initialGoodThing,
  onCancel,
  onSaved,
}: {
  date: string;
  initialMood: Mood | null;
  initialDayText: string;
  initialGoodThing: string;
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [dayText, setDayText] = useState(initialDayText);
  const [goodThing, setGoodThing] = useState(initialGoodThing);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function markDirty() {
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveJournalEntry(date, { mood, dayText, goodThing });
      setSaved(true);
      router.refresh();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="surface-card flex flex-col gap-4 p-4">
      <div>
        <p className="mb-2 text-[13px] font-bold text-text-primary">오늘의 기분</p>
        <div className="flex flex-wrap gap-1.5">
          {MOOD_OPTIONS.map((option) => {
            const active = mood === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMood(option);
                  markDirty();
                }}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={
                  active
                    ? { background: "var(--gradient-primary)", color: "#fff" }
                    : {
                        background: "var(--surface-soft)",
                        color: "var(--color-text-secondary)",
                        border: "var(--border-soft)",
                      }
                }
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-text-primary">오늘은 어떤 하루였나요?</span>
        <textarea
          value={dayText}
          onChange={(e) => {
            setDayText(e.target.value);
            markDirty();
          }}
          rows={3}
          placeholder="오늘 하루를 가볍게 적어보세요."
          className="min-h-[44px] w-full resize-none rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] leading-[1.6] text-text-secondary outline-none placeholder:text-text-disabled"
          style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-text-primary">오늘 내가 잘한 일은 무엇인가요?</span>
        <textarea
          value={goodThing}
          onChange={(e) => {
            setGoodThing(e.target.value);
            markDirty();
          }}
          rows={2}
          placeholder="작은 것이라도 좋아요."
          className="min-h-[44px] w-full resize-none rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] leading-[1.6] text-text-secondary outline-none placeholder:text-text-disabled"
          style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
        />
      </label>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-disabled">
          {error ? <span className="text-error">{error}</span> : saved ? "저장됨" : "저장 안 됨"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className="rounded-full px-4 py-1.5 text-[12px] font-semibold text-text-inverse disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-full px-4 py-1.5 text-[12px] font-semibold text-text-secondary"
              style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
