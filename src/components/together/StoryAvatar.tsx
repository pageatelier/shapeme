"use client";

import { useId } from "react";
import { CheckIcon, PlusIcon } from "@/components/icons";

const SIZE = 60;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StoryAvatar({
  displayName,
  avatarUrl,
  progress,
  isMe,
  onClick,
  ariaLabel,
}: {
  displayName: string;
  avatarUrl: string | null;
  /** 0-100, or null when there's no activity today (renders a plain gray ring). */
  progress: number | null;
  isMe?: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  const gradientId = useId();
  const hasActivity = progress !== null && progress > 0;
  const pct = Math.min(100, Math.max(0, progress ?? 0));
  const isComplete = pct >= 100;
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  const initial = displayName.trim().charAt(0) || "?";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex w-16 shrink-0 flex-col items-center gap-1.5"
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--progress-track)"
            strokeWidth={STROKE}
          />
          {hasActivity && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 400ms var(--ease-standard)" }}
            />
          )}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f2bdca" />
              <stop offset="48%" stopColor="#eda6a8" />
              <stop offset="100%" stopColor="#f3a16f" />
            </linearGradient>
          </defs>
        </svg>

        <div
          className="absolute overflow-hidden rounded-full"
          style={{ inset: STROKE + 2, background: "var(--gradient-primary)" }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[15px] font-bold text-text-inverse">
              {initial}
            </span>
          )}
        </div>

        {isMe ? (
          <span
            className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-xs)", border: "2px solid var(--color-bg)" }}
          >
            <PlusIcon className="h-2.5 w-2.5 text-white" />
          </span>
        ) : (
          isComplete && (
            <span
              className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-xs)", border: "2px solid var(--color-bg)" }}
            >
              <CheckIcon className="h-2.5 w-2.5 text-white" />
            </span>
          )
        )}
      </div>

      <span className="max-w-full truncate text-[11px] font-medium text-text-secondary">{displayName}</span>
      <span className="font-en text-[10px] font-semibold text-text-muted">{pct}%</span>
    </button>
  );
}

export function StoryAvatarSkeleton() {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5">
      <div
        className="animate-pulse rounded-full"
        style={{ width: SIZE, height: SIZE, background: "var(--progress-track)" }}
      />
      <div className="h-2.5 w-8 animate-pulse rounded-full" style={{ background: "var(--progress-track)" }} />
    </div>
  );
}
