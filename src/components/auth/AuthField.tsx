import { forwardRef } from "react";

/**
 * Label lives as the input's placeholder (and an aria-label for a11y) —
 * no separate label line above the box. focus:placeholder-transparent
 * fades it out the moment the field is focused, rather than waiting for
 * the first keystroke like a plain placeholder would.
 */
export const AuthField = forwardRef<HTMLInputElement, { label: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  function AuthField({ label, ...inputProps }, ref) {
    return (
      <input
        ref={ref}
        aria-label={label}
        placeholder={label}
        {...inputProps}
        className="min-h-11 rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary placeholder:text-text-muted outline-none focus:placeholder:text-transparent"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      />
    );
  },
);
