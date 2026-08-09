"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayCopy } from "@/lib/copy/today";
import { saveDailyNote } from "@/lib/notes/mutations";
import type { DailyNote } from "@/lib/notes/queries";

/** The friend-sharing toggle this note used to have is dormant while the
 * Together/friends feature is hidden (see TogetherStories) — no point
 * exposing a visibility switch nobody else can see the effect of. Whatever
 * isPublic was already set to is preserved as-is on save. */
export function DailyMemo({ date, note }: { date: string; note: DailyNote }) {
  const router = useRouter();
  const [value, setValue] = useState(note.memo ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveDailyNote(date, value, note.isPublic);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : todayCopy.moment.saveError);
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
        placeholder={todayCopy.moment.placeholder}
        rows={3}
        className="min-h-[44px] w-full resize-none bg-transparent text-[13px] leading-[1.6] text-text-secondary outline-none placeholder:text-text-disabled"
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-text-secondary">
          {error ? <span className="text-error">{error}</span> : saved ? todayCopy.moment.saved : todayCopy.moment.unsaved}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="rounded-full px-4 py-1.5 text-[12px] font-semibold text-text-inverse disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? todayCopy.moment.saving : todayCopy.moment.save}
        </button>
      </div>
    </div>
  );
}
