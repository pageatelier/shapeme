"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateLabel } from "@/lib/body/date";
import { clearJournalEntry } from "@/lib/journal/mutations";
import type { JournalEntry } from "@/lib/journal/types";
import { JournalForm } from "./JournalForm";

export function JournalList({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [confirmDeleteDate, setConfirmDeleteDate] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(date: string) {
    setDeleting(true);
    setError(null);
    try {
      await clearJournalEntry(date);
      setConfirmDeleteDate(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
    } finally {
      setDeleting(false);
    }
  }

  if (entries.length === 0) {
    return (
      <p className="surface-card p-5 text-center text-[13px] text-text-muted">아직 작성한 기록이 없어요.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        if (editingDate === entry.date) {
          return (
            <JournalForm
              key={entry.date}
              date={entry.date}
              initialMood={entry.mood}
              initialDayText={entry.dayText ?? ""}
              initialGoodThing={entry.goodThing ?? ""}
              onCancel={() => setEditingDate(null)}
              onSaved={() => setEditingDate(null)}
            />
          );
        }

        return (
          <div key={entry.date} className="surface-card flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-text-primary">{formatDateLabel(entry.date)}</span>
              {entry.mood && (
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-text-secondary"
                  style={{ background: "var(--surface-soft)", border: "var(--border-soft)" }}
                >
                  {entry.mood}
                </span>
              )}
            </div>

            {entry.dayText && (
              <p className="line-clamp-2 text-[13px] leading-relaxed text-text-secondary">{entry.dayText}</p>
            )}
            {entry.goodThing && (
              <p className="line-clamp-1 text-[12px] leading-relaxed text-text-muted">잘한 일 · {entry.goodThing}</p>
            )}

            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingDate(entry.date)}
                className="text-[12px] font-semibold text-pink-500"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteDate(entry.date)}
                className="text-[12px] font-semibold text-text-muted"
              >
                삭제
              </button>
            </div>

            {confirmDeleteDate === entry.date && (
              <div
                className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] p-2.5"
                style={{ background: "var(--color-error-soft)" }}
              >
                <span className="text-[11px] text-text-secondary">
                  {error ?? "이 기록을 삭제할까요?"}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.date)}
                    disabled={deleting}
                    className="rounded-full px-3 py-1 text-[11px] font-bold text-text-inverse disabled:opacity-60"
                    style={{ background: "var(--color-error)" }}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteDate(null);
                      setError(null);
                    }}
                    disabled={deleting}
                    className="rounded-full px-3 py-1 text-[11px] font-semibold text-text-secondary"
                    style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
