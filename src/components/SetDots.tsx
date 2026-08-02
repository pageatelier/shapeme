"use client";

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
    <div className="flex gap-1.5">
      {sets.map((done, i) => {
        const Comp = onToggle ? "button" : "div";
        return (
          <Comp
            key={i}
            type={onToggle ? "button" : undefined}
            onClick={onToggle ? () => onToggle(i) : undefined}
            aria-pressed={onToggle ? done : undefined}
            className="rounded-[8px] border transition-transform active:scale-95"
            style={{
              width: size,
              height: size,
              background: done ? "var(--gradient-primary)" : "rgba(255,255,255,0.72)",
              borderColor: done ? "transparent" : "rgba(86, 62, 58, 0.12)",
              boxShadow: done ? "0 6px 14px rgba(217, 126, 148, 0.24)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}
