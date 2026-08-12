"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccountPermanently } from "@/lib/account/actions";
import { createClient } from "@/lib/supabase/client";

const CONFIRM_WORD = "DELETE";

/**
 * "Delete account" — the page's one true danger action, kept off to the
 * side at the very bottom rather than inside any SettingsGroup card, and
 * collapsed to a small, quiet trigger (not a standing red box) so
 * Settings doesn't open with a warning-heavy first screen. Same
 * expand-to-confirm pattern as DeleteAccountSection ("Reset your Silua
 * data"), but this one removes the login account itself — the actual
 * destructive work runs server-side in deleteAccountPermanently() since
 * deleting an auth user needs the service_role key.
 */
export function PermanentDeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccountPermanently();
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full pb-2 text-center text-[12px] font-medium"
        style={{ color: "var(--color-error)" }}
      >
        Delete account
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] p-4"
      style={{ background: "var(--color-error-soft)", border: "1px solid rgba(203, 116, 128, 0.25)" }}
    >
      <p className="text-[13px] font-bold text-text-primary">Delete your account?</p>
      <p className="text-[12px] leading-relaxed text-text-secondary">
        This permanently deletes your Silua account and all of your data, including body photos, workouts, meals,
        water logs, notes, and profile information. This can&apos;t be undone.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={`Type "${CONFIRM_WORD}" to confirm`}
        className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
        style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
      />
      {error && <p className="text-[12px] text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={confirmText !== CONFIRM_WORD || deleting}
          className="min-h-[40px] flex-1 rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-40"
          style={{ background: "var(--color-error)" }}
        >
          {deleting ? "Deleting..." : "Delete account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError(null);
          }}
          disabled={deleting}
          className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
