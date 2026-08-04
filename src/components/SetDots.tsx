"use client";

import { CheckIcon } from "@/components/icons";

export function SetDots({
  sets,
  onToggle,
  size = 22,
}: {
  sets: boolean[];
  onToggle?: (index: number) => void;
  size?: number;
}) {
  return (
    <div className="flex gap-2">
      {sets.map((done, i) => {
        const Comp = onToggle ? "button" : "div";
        return (
          <Comp
            key={i}
            type={onToggle ? "button" : undefined}
            onClick={onToggle ? () => onToggle(i) : undefined}
            aria-pressed={onToggle ? done : undefined}
            aria-label={`세트 ${i + 1}${done ? " 완료" : ""}`}
            className="flex items-center justify-center rounded-[var(--radius-xs)] border transition-transform active:scale-95"
            style={{
              width: size,
              height: size,
              background: done ? "var(--gradient-primary)" : "rgba(255,255,255,0.72)",
              borderColor: done ? "transparent" : "rgba(86, 62, 58, 0.12)",
              boxShadow: done ? "0 6px 14px rgba(217, 126, 148, 0.24)" : "none",
            }}
          >
            {done ? (
              <CheckIcon className="h-[55%] w-[55%] text-white" />
            ) : (
              <span className="font-en text-[11px] font-semibold text-text-secondary">{i + 1}</span>
            )}
          </Comp>
        );
      })}
    </div>
  );
}
