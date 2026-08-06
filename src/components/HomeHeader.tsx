"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { HeartIcon } from "@/components/icons";
import { CHEER_RECEIVED_PHRASE } from "@/lib/friends/types";
import type { CheerType } from "@/lib/friends/types";

export function HomeHeader({
  cheerNotifications,
}: {
  cheerNotifications: { senderId: string; displayName: string; type: CheerType }[];
}) {
  const [open, setOpen] = useState(false);
  const hasCheers = cheerNotifications.length > 0;

  return (
    <div className="relative flex items-center justify-center">
      <BrandLogo />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="오늘 받은 응원 확인"
        className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: "#FFF8F4", border: "1px solid #E9DDD2" }}
      >
        <HeartIcon className="h-4 w-4 text-[#D88F95]" />
        {hasCheers && (
          <span
            className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full"
            style={{ background: "#E7A1A6", border: "1.5px solid var(--color-bg)" }}
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
                {cheerNotifications.map(({ senderId, displayName, type }) => (
                  <p key={`${senderId}-${type}`} className="text-[12px] leading-relaxed text-text-secondary">
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
