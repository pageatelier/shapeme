"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WaterDropIcon, PlusIcon } from "@/components/icons";
import { addWaterLog } from "@/lib/water/mutations";
import type { WaterLog } from "@/lib/water/types";

export function WaterView({
  entries,
  totalMl,
  goalMl,
  cupMl,
}: {
  entries: WaterLog[];
  totalMl: number;
  goalMl: number;
  cupMl: number;
}) {
  const router = useRouter();
  const [localEntries, setLocalEntries] = useState(entries);
  const [localTotal, setLocalTotal] = useState(totalMl);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const percent = Math.min(100, Math.round((localTotal / goalMl) * 100));
  const presets = Array.from(new Set([cupMl, 250, 500])).filter((n) => n > 0);

  async function handleAdd(amount: number) {
    setPending(amount);
    setError(null);
    const now = new Date();
    const optimistic: WaterLog = {
      id: `local-${now.getTime()}`,
      amountMl: amount,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      loggedAt: now.toISOString(),
    };
    setLocalEntries((prev) => [...prev, optimistic]);
    setLocalTotal((prev) => prev + amount);

    try {
      await addWaterLog(amount);
      router.refresh();
    } catch (err) {
      setLocalEntries((prev) => prev.filter((e) => e.id !== optimistic.id));
      setLocalTotal((prev) => prev - amount);
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <div className="glass-card p-6 text-center">
        <WaterDropIcon className="mx-auto mb-3 h-8 w-8 text-pink-400" />
        <p className="font-en text-4xl font-semibold tracking-[-0.04em] text-text-primary">
          {localTotal.toLocaleString()}
          <span className="text-base font-medium text-text-muted"> / {goalMl.toLocaleString()}ml</span>
        </p>
        <p className="mt-1 text-[13px] text-text-secondary">오늘 목표의 {percent}%를 마셨어요.</p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${percent}%`, background: "var(--gradient-primary)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {presets.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleAdd(amount)}
            disabled={pending !== null}
            className="surface-card flex min-h-[72px] flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4 text-pink-400" />
            <span className="font-en text-sm font-semibold text-text-primary">
              {pending === amount ? "저장 중..." : `${amount}ml`}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="text-center text-[12px] text-error">{error}</p>}

      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">오늘의 기록</p>
        <div className="surface-card divide-y" style={{ borderColor: "rgba(86,62,58,0.07)" }}>
          {localEntries.length === 0 && (
            <p className="p-4 text-[13px] text-text-muted">아직 기록이 없어요.</p>
          )}
          {localEntries
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4"
                style={{ borderColor: "rgba(86,62,58,0.07)" }}
              >
                <span className="font-en text-[13px] text-text-muted">{entry.time}</span>
                <span className="text-[13px] font-semibold text-text-primary">+{entry.amountMl}ml</span>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
