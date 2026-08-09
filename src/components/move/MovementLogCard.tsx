"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMovementLog } from "@/lib/movement/mutations";
import { ACTIVITY_CONFIG } from "@/lib/movement/types";
import type { MovementLog } from "@/lib/movement/types";
import { MovementLogForm } from "./MovementLogForm";

export function MovementLogCard({ log, date }: { log: MovementLog; date: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <MovementLogForm date={date} activityType={log.activityType} log={log} onDone={() => setEditing(false)} />
    );
  }

  const config = ACTIVITY_CONFIG[log.activityType];
  const details = [
    `${log.durationMinutes}분`,
    log.distanceKm != null ? `${log.distanceKm}km` : null,
    log.steps != null ? `${log.steps.toLocaleString()}걸음` : null,
    log.calories != null ? `${log.calories}kcal` : null,
  ].filter(Boolean);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteMovementLog(log.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
      setDeleting(false);
    }
  }

  return (
    <div className="surface-card flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-text-primary">{config.label}</p>
          <p className="mt-0.5 text-[13px] text-text-secondary">{details.join(" · ")}</p>
          {log.memo && <p className="mt-1 text-[12px] text-text-muted">{log.memo}</p>}
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-semibold text-pink-500">
            수정
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-[12px] font-semibold text-text-muted"
          >
            삭제
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <div
          className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] p-2.5"
          style={{ background: "var(--color-error-soft)" }}
        >
          <span className="text-[11px] text-text-secondary">{error ?? "이 기록을 삭제할까요?"}</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full px-3 py-1 text-[11px] font-bold text-text-inverse disabled:opacity-60"
              style={{ background: "var(--color-error)" }}
            >
              삭제
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(false);
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
}
