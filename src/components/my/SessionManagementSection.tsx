"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SessionManagementSection() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOutOthers() {
    setPending(true);
    setError(null);
    setDone(false);
    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });
      if (signOutError) throw signOutError;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-text-primary">Signed-in devices</span>
        <button
          type="button"
          onClick={handleSignOutOthers}
          disabled={pending}
          className="shrink-0 text-[12px] font-semibold text-pink-500 disabled:opacity-60"
        >
          {pending ? "Signing out..." : "Sign out other devices"}
        </button>
      </div>
      <p className="text-[11px] text-text-secondary">Keep this device signed in and sign out everywhere else.</p>
      {done && <p className="text-[11px]" style={{ color: "var(--color-success)" }}>Done.</p>}
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  );
}
