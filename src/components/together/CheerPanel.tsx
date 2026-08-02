"use client";

import { useState } from "react";
import { sendCheer } from "@/lib/friends/mutations";

const CHEER_OPTIONS = [
  { type: "slow", label: "🌷 오늘도 천천히" },
  { type: "doing_great", label: "💗 잘하고 있어" },
  { type: "together", label: "✨ 같이 해요" },
] as const;

type CheerType = (typeof CHEER_OPTIONS)[number]["type"];

/** Only these three fixed, positive phrases — never free text (see
 * supabase/migrations/0007_cheer_types.sql's check constraint). */
export function CheerPanel({
  receiverId,
  cheeredInitially,
  onSent,
}: {
  receiverId: string;
  cheeredInitially: boolean;
  onSent: () => void;
}) {
  const [cheered, setCheered] = useState(cheeredInitially);
  const [selected, setSelected] = useState<CheerType | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!selected || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendCheer(receiverId, selected);
      setCheered(true);
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "응원에 실패했어요.");
    } finally {
      setSending(false);
    }
  }

  if (cheered) {
    return (
      <div
        className="flex min-h-[54px] items-center justify-center rounded-[18px] text-[14px] font-bold text-text-secondary"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      >
        오늘의 응원을 보냈어요 💗
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center gap-2">
        {CHEER_OPTIONS.map((opt) => {
          const active = selected === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => setSelected(opt.type)}
              className="min-h-[46px] flex-1 rounded-full px-1.5 text-[11px] font-semibold whitespace-nowrap transition-transform duration-150 active:scale-[0.97]"
              style={
                active
                  ? { background: "var(--gradient-primary)", color: "#fff", border: "1px solid transparent" }
                  : {
                      background: "rgba(255,255,255,0.55)",
                      color: "var(--color-text-primary)",
                      border: "1px solid rgba(255,255,255,0.7)",
                    }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-center text-[11px] text-error">{error}</p>}

      <button
        type="button"
        onClick={handleSend}
        disabled={!selected || sending}
        className="mx-[6px] min-h-[54px] rounded-[18px] text-[15px] font-bold text-white transition-opacity disabled:opacity-40"
        style={{ background: "var(--gradient-primary)" }}
      >
        {sending ? "보내는 중..." : "응원 보내기"}
      </button>
    </div>
  );
}
