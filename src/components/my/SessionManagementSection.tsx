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
      setError(err instanceof Error ? err.message : "실패했어요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-text-primary">로그인 관리</span>
        <button
          type="button"
          onClick={handleSignOutOthers}
          disabled={pending}
          className="shrink-0 text-[12px] font-semibold text-pink-500 disabled:opacity-60"
        >
          {pending ? "처리 중..." : "다른 기기 모두 로그아웃"}
        </button>
      </div>
      <p className="text-[11px] text-text-secondary">현재 기기는 유지하고, 다른 곳에 로그인된 세션만 종료해요.</p>
      {done && <p className="text-[11px]" style={{ color: "var(--color-success)" }}>완료됐어요.</p>}
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  );
}
