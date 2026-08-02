"use client";

import { useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { ProgressRing } from "@/components/ProgressRing";
import type { FriendCard } from "@/lib/friends/types";
import { CheerButton } from "./CheerButton";

function statusMessage(friend: FriendCard): string {
  if (!friend.hasActivityToday) return "아직 오늘의 기록을 시작하지 않았어요.";
  if (friend.todayProgress >= 100) return "오늘의 나를 온전히 채웠어요.";
  return "오늘도 천천히 나를 채워가고 있어요.";
}

export function StoryViewer({
  friends,
  index,
  onIndexChange,
  onClose,
}: {
  friends: FriendCard[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const friend = friends[index];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!friend) return null;

  const hasPrev = index > 0;
  const hasNext = index < friends.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(40, 30, 28, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[var(--container-sm)] flex-col gap-5 rounded-t-[28px] p-6 pb-8"
        style={{ background: "var(--gradient-soft)", boxShadow: "var(--shadow-floating)" }}
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
            onClick={() => hasPrev && onIndexChange(index - 1)}
            disabled={!hasPrev}
            className="absolute inset-y-0 left-0 w-1/3"
          />
          <button
            type="button"
            aria-label="다음 친구"
            onClick={() => hasNext && onIndexChange(index + 1)}
            disabled={!hasNext}
            className="absolute inset-y-0 right-0 w-1/3"
          />

          <div className="h-16 w-16 overflow-hidden rounded-full" style={{ background: "var(--gradient-primary)" }}>
            {friend.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-text-inverse">
                {friend.displayName.charAt(0)}
              </span>
            )}
          </div>

          {friend.hasActivityToday && (
            <ProgressRing percent={friend.todayProgress} size={140} strokeWidth={12} />
          )}

          <p className="max-w-[260px] text-center text-[14px] leading-relaxed text-text-secondary">
            {statusMessage(friend)}
          </p>
        </div>

        <CheerButton
          key={friend.friendId}
          receiverId={friend.friendId}
          cheeredInitially={friend.cheeredByMe}
          idleLabel={friend.hasActivityToday ? "응원하기" : "가볍게 응원하기"}
        />
      </div>
    </div>
  );
}
