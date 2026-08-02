import type { ChangeEvent, ReactNode } from "react";
import { ChevronRightIcon } from "@/components/icons";

/** Plain informational row — no click affordance, since nothing happens on click. */
export function StaticRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex w-full items-center justify-between px-4 py-3.5 text-left">
      <span className="text-[13px] font-medium text-text-primary">{label}</span>
      {value && <span className="text-xs text-text-muted">{value}</span>}
    </div>
  );
}

/** Row that performs a real action/navigation on click. */
export function ActionRow({
  label,
  value,
  danger,
  onClick,
}: {
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
      <span
        className="text-[13px] font-medium"
        style={{ color: danger ? "var(--color-error)" : "var(--color-text-primary)" }}
      >
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-text-muted">
        {value}
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 px-1 text-[13px] font-bold text-text-secondary">{title}</p>
      <div className="surface-card divide-y" style={{ borderColor: "rgba(86,62,58,0.07)" }}>
        {children}
      </div>
    </section>
  );
}

export function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  suffix,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "time";
  suffix?: string;
}) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <div className="relative">
        <input
          value={value}
          onChange={handleChange}
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          className="min-h-[44px] w-full rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
          style={{
            background: "var(--surface-solid)",
            border: "var(--border-soft)",
            paddingRight: suffix ? "40px" : undefined,
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
        style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EditActions({
  saving,
  error,
  onSave,
  onCancel,
}: {
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      {error && <p className="text-[12px] text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="min-h-[40px] flex-1 rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          취소
        </button>
      </div>
    </>
  );
}
