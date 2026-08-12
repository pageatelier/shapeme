import { forwardRef, type ReactNode } from "react";

/**
 * Label lives as the input's placeholder (and an aria-label for a11y) —
 * no separate label line above the box. focus:placeholder-transparent
 * fades it out the moment the field is focused, rather than waiting for
 * the first keystroke like a plain placeholder would.
 *
 * rightSlot renders inside the field (e.g. the password show/hide toggle)
 * — the input gets right padding to clear it automatically.
 */
export const AuthField = forwardRef<
  HTMLInputElement,
  { label: string; rightSlot?: ReactNode } & React.InputHTMLAttributes<HTMLInputElement>
>(function AuthField({ label, rightSlot, className, ...inputProps }, ref) {
  return (
    <div className="relative">
      <input
        ref={ref}
        aria-label={label}
        placeholder={label}
        {...inputProps}
        className={`min-h-11 w-full rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary placeholder:text-text-muted outline-none focus:placeholder:text-transparent ${rightSlot ? "pr-11" : ""} ${className ?? ""}`}
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      />
      {rightSlot && <div className="absolute top-1/2 right-1 -translate-y-1/2">{rightSlot}</div>}
    </div>
  );
});
