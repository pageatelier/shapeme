"use client";

import { useEffect } from "react";

/** Small self-dismissing toast. Render conditionally from the parent's own
 * `message` state — e.g. `{toast && <Toast message={toast} onDismiss={() => setToast(null)} />}`. */
export function Toast({
  message,
  onDismiss,
  durationMs = 2400,
}: {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  return (
    <div
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-center text-[13px] font-semibold text-text-inverse"
      style={{
        width: "calc(100% - 32px)",
        maxWidth: "calc(var(--container-sm) - 32px)",
        background: "var(--gradient-primary)",
        boxShadow: "var(--shadow-floating)",
      }}
      role="status"
    >
      {message}
    </div>
  );
}
