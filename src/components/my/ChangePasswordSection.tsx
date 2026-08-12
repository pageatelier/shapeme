"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function close() {
    setOpen(false);
    setPassword("");
    setConfirm("");
    setError(null);
    setDone(false);
  }

  async function handleSave() {
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-[13px] font-medium text-text-primary">Change password</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (6+ characters)"
        autoComplete="new-password"
        className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
        style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        autoComplete="new-password"
        className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
        style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
      />
      {error && <p className="text-[12px] text-error">{error}</p>}
      {done && <p className="text-[12px]" style={{ color: "var(--color-success)" }}>Password changed.</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="min-h-[40px] flex-1 rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? "Changing..." : "Change"}
        </button>
        <button
          type="button"
          onClick={close}
          disabled={saving}
          className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
