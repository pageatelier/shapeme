"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveDailyNote } from "@/lib/notes/mutations";
import type { DailyNote } from "@/lib/notes/queries";

export function DailyMemo({ date, note }: { date: string; note: DailyNote }) {
  const router = useRouter();
  const [value, setValue] = useState(note.memo ?? "");
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveDailyNote(date, value, isPublic);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  function markDirty() {
    setSaved(false);
  }

  return (
    <div className="surface-card p-4">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          markDirty();
        }}
        placeholder="오늘 가장 잘한 점은 무엇인가요?"
        rows={3}
        className="min-h-[44px] w-full resize-none bg-transparent text-[13px] leading-[1.6] text-text-secondary outline-none placeholder:text-text-disabled"
      />

      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            setIsPublic(false);
            markDirty();
          }}
          className={`rounded-full px-3 py-1 text-[11px] ${!isPublic ? "pill-selected" : "pill-unselected"}`}
        >
          나만 보기
        </button>
        <button
          type="button"
          onClick={() => {
            setIsPublic(true);
            markDirty();
          }}
          className={`rounded-full px-3 py-1 text-[11px] ${isPublic ? "pill-selected" : "pill-unselected"}`}
        >
          친구에게 공개
        </button>
      </div>
      {isPublic && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
          친구 목록의 내 프로필 위에 짧게 보여요. 눈바디 사진·체중·운동 기록은 여전히 공개되지 않아요.
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-text-secondary">
          {error ? <span className="text-error">{error}</span> : saved ? "저장됨" : "저장 안 됨"}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="rounded-full px-4 py-1.5 text-[12px] font-semibold text-text-inverse disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
