"use client";

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={on}
      className="relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-60"
      style={{ background: on ? "var(--gradient-primary)" : "var(--progress-track)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left]"
        style={{ left: on ? 18 : 2, boxShadow: "var(--shadow-xs)" }}
      />
    </button>
  );
}

export function ToggleRow({
  label,
  on,
  onToggle,
  disabled,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[13px] font-medium text-text-primary">{label}</span>
      <Toggle on={on} onToggle={onToggle} disabled={disabled} />
    </div>
  );
}
