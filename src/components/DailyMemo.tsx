"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveDailyNote } from "@/lib/notes/mutations";

export function DailyMemo({ date, memo }: { date: string; memo: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(memo ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveDailyNote(date, value);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="surface-card p-4">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="오늘 가장 잘한 점은 무엇인가요?"
        rows={3}
        className="min-h-[44px] w-full resize-none bg-transparent text-[13px] leading-[1.6] text-text-secondary outline-none placeholder:text-text-disabled"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-text-disabled">
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
