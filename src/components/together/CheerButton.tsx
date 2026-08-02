"use client";

import { useState } from "react";
import { sendCheer } from "@/lib/friends/mutations";

export function CheerButton({
  receiverId,
  cheeredInitially,
  idleLabel = "응원하기",
}: {
  receiverId: string;
  cheeredInitially: boolean;
  idleLabel?: string;
}) {
  const [cheered, setCheered] = useState(cheeredInitially);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (cheered || sending) return;
    setSending(true);
    setError(null);
    setCheered(true);
    try {
      await sendCheer(receiverId);
    } catch (err) {
      setCheered(false);
      setError(err instanceof Error ? err.message : "응원에 실패했어요.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={cheered || sending}
        className="min-h-[46px] w-full rounded-full text-[14px] font-bold text-text-inverse disabled:opacity-90"
        style={{ background: cheered ? "var(--color-success)" : "var(--gradient-primary)" }}
      >
        {cheered ? "응원 보냄 ✓" : sending ? "보내는 중..." : idleLabel}
      </button>
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  );
}
