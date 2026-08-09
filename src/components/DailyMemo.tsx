"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { todayCopy } from "@/lib/copy/today";
import { saveDailyNote } from "@/lib/notes/mutations";
import type { DailyNote } from "@/lib/notes/queries";

const PREVIEW_MAX = 48;

function preview(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > PREVIEW_MAX ? `${trimmed.slice(0, PREVIEW_MAX)}…` : trimmed;
}

/** Today only shows a compact entry point (prompt or a preview of what's
 * already saved) — tapping it opens this same card's full textarea+Save
 * inline, closing back to the compact view once saved. The friend-sharing
 * toggle this note used to have is dormant while Together is hidden (see
 * TogetherStories) — isPublic is preserved as-is on save, no UI for it. */
export function DailyMemo({ date, note }: { date: string; note: DailyNote }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
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
      setExpanded(false);
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

  if (!expanded) {
    const hasValue = value.trim().length > 0;
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="surface-card flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-[13px] text-text-primary">{hasValue ? preview(value) : todayCopy.moment.placeholder}</p>
          <p className="mt-1 text-[11px] font-semibold text-text-muted">
            {hasValue ? todayCopy.moment.editNote : todayCopy.moment.addNote}
          </p>
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-muted" />
      </button>
    );
  }

  return (
    <div className="surface-card p-4">
      <textarea
        autoFocus
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-text-secondary"
          >
            {todayCopy.moment.close}
          </button>
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
    </div>
  );
}
