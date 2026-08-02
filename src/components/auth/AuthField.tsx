export function AuthField({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
      <input
        {...inputProps}
        className="min-h-[48px] rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      />
    </label>
  );
}
