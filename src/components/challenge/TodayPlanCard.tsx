"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DumbbellIcon, HeartIcon } from "@/components/icons";
import { clearChallengeDayLog, saveRecoveryDay } from "@/lib/challenge/mutations";
import { RECOVERY_REASON_LABELS, type ChallengeDayLog } from "@/lib/challenge/types";

export function TodayPlanCard({
  challengeId,
  date,
  routineName,
  exerciseCount,
  totalSets,
  sessionMinutes,
  todayLog,
}: {
  challengeId: string;
  date: string;
  routineName: string | null;
  exerciseCount: number;
  totalSets: number;
  sessionMinutes: number;
  todayLog: ChallengeDayLog | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function chooseRecovery(reason: string) {
    setSaving(true);
    setError(null);
    try {
      await saveRecoveryDay({ challengeId, date, reason });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "회복일 저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function undo() {
    setSaving(true);
    setError(null);
    try {
      await clearChallengeDayLog(challengeId, date);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "기록을 되돌리지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  if (todayLog?.status === "recovery") {
    return (
      <section className="glass-card p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full text-pink-500" style={{ background: "var(--color-pink-100)" }}>
          <HeartIcon className="h-5 w-5" />
        </div>
        <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.11em] text-pink-500 uppercase">Recovery Day</p>
        <h2 className="mb-2 text-[21px] font-bold tracking-[-0.04em] text-text-primary">오늘은 충분히 쉬어가요</h2>
        <p className="mb-5 text-[13px] leading-relaxed text-text-secondary">
          {todayLog.recoveryReason ? RECOVERY_REASON_LABELS[todayLog.recoveryReason] ?? "회복이 필요한 날이에요." : "회복이 필요한 날이에요."} 예정된 운동은 다음 운동일에 그대로 이어집니다.
        </p>
        <button type="button" onClick={undo} disabled={saving} className="text-[12px] font-semibold text-text-muted disabled:opacity-60">
          {saving ? "변경 중..." : "다시 운동하는 날로 바꾸기"}
        </button>
        {error && <p className="mt-2 text-[12px] text-error">{error}</p>}
      </section>
    );
  }

  if (todayLog?.status === "workout") {
    return (
      <section className="glass-card p-6">
        <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.11em] text-success uppercase">Workout Complete</p>
        <h2 className="mb-2 text-[21px] font-bold tracking-[-0.04em] text-text-primary">오늘 운동을 완료했어요</h2>
        <p className="mb-5 text-[13px] leading-relaxed text-text-secondary">
          {todayLog.routineName ?? routineName} · {todayLog.completedSets}/{todayLog.totalSets}세트
        </p>
        <Link href="/workout" className="inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-[13px] font-bold text-text-inverse" style={{ background: "var(--gradient-primary)" }}>
          오늘 기록 보기
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-full text-peach-500" style={{ background: "var(--color-peach-100)" }}>
            <DumbbellIcon className="h-5 w-5" />
          </div>
          <span className="font-en rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-text-muted uppercase" style={{ background: "var(--surface-card)" }}>
            Today&apos;s workout
          </span>
        </div>
        <h2 className="mb-2 text-[21px] font-bold tracking-[-0.04em] text-text-primary">
          {routineName ?? "프로그램을 준비하고 있어요"}
        </h2>
        <p className="mb-6 text-[13px] text-text-secondary">
          {exerciseCount}개 운동 · {totalSets}세트 · 약 {sessionMinutes}분
        </p>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Link href="/workout" className="flex min-h-[50px] items-center justify-center rounded-full text-[14px] font-bold text-text-inverse" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}>
            운동 시작하기
          </Link>
          <button type="button" onClick={() => setOpen(true)} className="min-h-[50px] rounded-full px-4 text-[12px] font-semibold text-text-secondary" style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}>
            회복일
          </button>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 backdrop-blur-[2px]" onClick={() => !saving && setOpen(false)}>
          <div className="w-full max-w-[448px] rounded-[32px] p-6" style={{ background: "var(--surface-solid)", boxShadow: "var(--shadow-floating)" }} onClick={(event) => event.stopPropagation()}>
            <p className="mb-2 text-[20px] font-bold tracking-[-0.035em] text-text-primary">오늘은 왜 쉬어갈까요?</p>
            <p className="mb-5 text-[13px] leading-relaxed text-text-secondary">회복일은 실패로 계산되지 않고, 오늘 예정된 루틴은 다음 운동일에 이어져요.</p>
            <div className="grid gap-2">
              {Object.entries(RECOVERY_REASON_LABELS).map(([reason, label]) => (
                <button key={reason} type="button" onClick={() => chooseRecovery(reason)} disabled={saving} className="min-h-[48px] rounded-[var(--radius-md)] px-4 text-left text-[13px] font-semibold text-text-primary disabled:opacity-50" style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}>
                  {label}
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-[12px] text-error">{error}</p>}
            <button type="button" onClick={() => setOpen(false)} disabled={saving} className="mt-4 w-full py-2 text-[12px] font-semibold text-text-muted">취소</button>
          </div>
        </div>
      )}
    </>
  );
}
