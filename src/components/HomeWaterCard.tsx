"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WaterDropIcon } from "@/components/icons";
import { addWaterLog, removeLastWaterLog } from "@/lib/water/mutations";
import type { WaterLog } from "@/lib/water/types";

export function HomeWaterCard({
  date,
  entries,
  totalMl,
  goalMl,
  cupMl,
}: {
  date: string;
  entries: WaterLog[];
  totalMl: number;
  goalMl: number;
  cupMl: number;
}) {
  const router = useRouter();
  const [localEntries, setLocalEntries] = useState(entries);
  const [localTotal, setLocalTotal] = useState(totalMl);
  const [pending, setPending] = useState<"add" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const percent = Math.min(100, Math.round((localTotal / goalMl) * 100));
  const lastEntry = localEntries[localEntries.length - 1];

  async function handleAdd() {
    setPending("add");
    setError(null);
    const now = new Date();
    const optimistic: WaterLog = {
      id: `local-${now.getTime()}`,
      amountMl: cupMl,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      loggedAt: now.toISOString(),
    };
    setLocalEntries((prev) => [...prev, optimistic]);
    setLocalTotal((prev) => prev + cupMl);
    try {
      await addWaterLog(cupMl);
      router.refresh();
    } catch (err) {
      setLocalEntries((prev) => prev.filter((e) => e.id !== optimistic.id));
      setLocalTotal((prev) => prev - cupMl);
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setPending(null);
    }
  }

  async function handleRemove() {
    if (!lastEntry) return;
    setPending("remove");
    setError(null);
    const removed = lastEntry;
    setLocalEntries((prev) => prev.slice(0, -1));
    setLocalTotal((prev) => Math.max(0, prev - removed.amountMl));
    try {
      await removeLastWaterLog(date);
      router.refresh();
    } catch (err) {
      setLocalEntries((prev) => [...prev, removed]);
      setLocalTotal((prev) => prev + removed.amountMl);
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section>
      <div className="surface-card p-4">
        <Link href="/water" className="mb-3 block">
          <p className="mb-3 flex items-center gap-1.5 text-[13px] font-bold tracking-[-0.02em] text-text-secondary">
            <WaterDropIcon className="h-[15px] w-[15px] text-pink-400" />
            물 마시기
          </p>
          <p className="font-en mb-2 text-xl font-semibold tracking-[-0.03em] text-text-primary">
            {localTotal.toLocaleString()}
            <span className="text-xs font-medium text-text-muted"> / {goalMl.toLocaleString()}ml</span>
          </p>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${percent}%`, background: "var(--gradient-primary)" }}
            />
          </div>
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending !== null || !lastEntry}
            className="flex min-h-[34px] flex-1 items-center justify-center rounded-full border text-xs font-semibold text-text-primary disabled:opacity-40"
            style={{ borderColor: "rgba(86, 62, 58, 0.07)", background: "rgba(255,255,255,0.7)" }}
          >
            {pending === "remove" ? "삭제 중..." : `− ${cupMl}ml 빼기`}
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending !== null}
            className="flex min-h-[34px] flex-1 items-center justify-center rounded-full border text-xs font-semibold text-text-primary disabled:opacity-60"
            style={{ borderColor: "rgba(86, 62, 58, 0.07)", background: "rgba(255,255,255,0.7)" }}
          >
            {pending === "add" ? "저장 중..." : `+ ${cupMl}ml 추가`}
          </button>
        </div>

        {error && <p className="mt-2 text-center text-[11px] text-error">{error}</p>}
      </div>
    </section>
  );
}
