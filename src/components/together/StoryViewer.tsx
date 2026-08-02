"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { ProgressRing } from "@/components/ProgressRing";
import type { FriendCard } from "@/lib/friends/types";
import { CheerPanel } from "./CheerPanel";

function statusMessage(pct: number): string {
  if (pct <= 0) return "아직 오늘의 기록을 시작하지 않았어요.";
  if (pct >= 100) return "오늘의 루틴을 모두 완료했어요 ✨";
  return `오늘 ${pct}%를 채웠어요.`;
}

export function StoryViewer({
  friends,
  index,
  onIndexChange,
  onClose,
  onCheerSent,
}: {
  friends: FriendCard[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onCheerSent: (displayName: string) => void;
}) {
  const friend = friends[index];
  const [showPetals, setShowPetals] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (petalTimerRef.current) clearTimeout(petalTimerRef.current);
    };
  }, []);

  if (!friend) return null;

  const hasPrev = index > 0;
  const hasNext = index < friends.length - 1;

  function clearPendingClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setShowPetals(false);
  }

  function goPrev() {
    if (!hasPrev) return;
    clearPendingClose();
    onIndexChange(index - 1);
  }

  function goNext() {
    if (!hasNext) return;
    clearPendingClose();
    onIndexChange(index + 1);
  }

  function handleCheerSent() {
    setShowPetals(true);
    onCheerSent(friend.displayName);
    // Modal doesn't slam shut — a short beat to see the flourish, then close.
    petalTimerRef.current = setTimeout(() => setShowPetals(false), 800);
    closeTimerRef.current = setTimeout(() => onClose(), 800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(40, 30, 28, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[var(--container-sm)] flex-col gap-5 rounded-t-[28px] p-6"
        style={{
          background: "var(--gradient-soft)",
          boxShadow: "var(--shadow-floating)",
          // Clears the fixed BottomNav pill (~72px tall incl. its own
          // bottom-4 offset) plus breathing room, so the CTA never sits
          // underneath it.
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 104px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-1.5">
          {friends.map((f, i) => (
            <div
              key={f.friendId}
              className="h-[3px] flex-1 overflow-hidden rounded-full"
              style={{ background: "var(--progress-track)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: i <= index ? "100%" : "0%", background: "var(--gradient-primary)" }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-text-primary">{friend.displayName}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "var(--surface-card)" }}
          >
            <CloseIcon className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        <div className="relative flex flex-col items-center gap-4 py-4">
          <button
            type="button"
            aria-label="이전 친구"
            onClick={goPrev}
            disabled={!hasPrev}
            className="absolute inset-y-0 left-0 w-1/3"
          />
          <button
            type="button"
            aria-label="다음 친구"
            onClick={goNext}
            disabled={!hasNext}
            className="absolute inset-y-0 right-0 w-1/3"
          />

          <div className="relative h-16 w-16 overflow-hidden rounded-full" style={{ background: "var(--gradient-primary)" }}>
            {friend.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-text-inverse">
                {friend.displayName.charAt(0)}
              </span>
            )}
          </div>

          {showPetals && (
            <div className="petal-burst pointer-events-none absolute top-4 left-1/2 h-16 w-16 -translate-x-1/2">
              <span style={{ left: "6px", top: "8px", fontSize: 14, animationDelay: "0ms" }}>🌷</span>
              <span style={{ left: "26px", top: "0px", fontSize: 14, animationDelay: "90ms" }}>💗</span>
              <span style={{ left: "44px", top: "10px", fontSize: 14, animationDelay: "160ms" }}>🌷</span>
            </div>
          )}

          {friend.todayProgress > 0 && (
            <ProgressRing percent={friend.todayProgress} size={140} strokeWidth={12} />
          )}

          <p className="max-w-[260px] text-center text-[14px] leading-relaxed text-text-secondary">
            {statusMessage(friend.todayProgress)}
          </p>
        </div>

        <CheerPanel
          key={friend.friendId}
          receiverId={friend.friendId}
          cheeredInitially={friend.cheeredByMe}
          onSent={handleCheerSent}
        />
      </div>
    </div>
  );
}
