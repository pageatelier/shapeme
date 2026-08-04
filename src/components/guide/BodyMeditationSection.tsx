"use client";

const MEDITATIONS = [
  { label: "3분 호흡", duration: "3분" },
  { label: "5분 바디 스캔", duration: "5분" },
  { label: "긴장 풀기", duration: "7분" },
  { label: "자기 전 릴렉스", duration: "10분" },
];

export function BodyMeditationSection({ onSelect }: { onSelect: () => void }) {
  return (
    <section className="glass-card p-5">
      <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">바디 명상</p>
      <p className="mt-1 mb-4 text-[13px] text-text-secondary">잠시 몸의 신호에 집중해보세요.</p>
      <div className="grid grid-cols-2 gap-3">
        {MEDITATIONS.map((m) => (
          <button
            key={m.label}
            type="button"
            onClick={onSelect}
            className="flex flex-col items-start gap-1 rounded-[var(--radius-md)] p-4 text-left"
            style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
          >
            <span className="font-en text-[11px] font-semibold text-text-muted">{m.duration}</span>
            <span className="text-[13px] font-semibold text-text-primary">{m.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
