import { forwardRef } from "react";

export const AuthField = forwardRef<HTMLInputElement, { label: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  function AuthField({ label, ...inputProps }, ref) {
    return (
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
        <input
          ref={ref}
          {...inputProps}
          className="min-h-11 rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
      </label>
    );
  },
);
