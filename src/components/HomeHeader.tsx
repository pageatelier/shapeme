"use client";

import { useState } from "react";
import { CHEER_RECEIVED_PHRASE } from "@/lib/friends/types";
import type { CheerType } from "@/lib/friends/types";

export function HomeHeader({
  cheerNotifications,
}: {
  cheerNotifications: { displayName: string; type: CheerType }[];
}) {
  const [open, setOpen] = useState(false);
  const hasCheers = cheerNotifications.length > 0;

  return (
    <div className="relative flex items-center justify-center">
      <span className="font-en text-2xl font-medium tracking-[-0.055em] text-text-primary lowercase">
        shapeme
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="오늘 받은 응원 확인"
        className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      >
        <span className="text-[16px] leading-none">🌷</span>
        {hasCheers && (
          <span
            className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full"
            style={{ background: "var(--color-error)", border: "1.5px solid var(--color-bg)" }}
          />
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="알림 닫기"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            className="absolute top-11 right-0 z-20 w-64 rounded-[var(--radius-lg)] p-3.5"
            style={{
              background: "var(--glass-background-strong)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-floating)",
              backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
              WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
            }}
          >
            {hasCheers ? (
              <div className="flex flex-col gap-2.5">
                {cheerNotifications.map(({ displayName, type }, i) => (
                  <p key={i} className="text-[12px] leading-relaxed text-text-secondary">
                    <span className="font-semibold text-text-primary">{displayName}</span>님이{" "}
                    {CHEER_RECEIVED_PHRASE[type]} 응원했어요 🌷
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-text-muted">오늘 받은 응원이 아직 없어요.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
