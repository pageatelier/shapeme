"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccountPermanently } from "@/lib/account/actions";
import { createClient } from "@/lib/supabase/client";

const CONFIRM_WORD = "삭제";

/**
 * Same confirm-word/expand pattern as DeleteAccountSection, but this one
 * actually removes the login account too (that section deliberately keeps
 * it) — the destructive work happens server-side in deleteAccountPermanently()
 * since deleting an auth user requires the service_role key.
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
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
      setDeleting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-[13px] font-medium" style={{ color: "var(--color-error)" }}>
          계정 영구 삭제
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-[13px] font-bold text-text-primary">정말 삭제할까요?</p>
      <p className="text-[12px] leading-relaxed text-text-secondary">
        눈바디 사진, 운동 기록, 물·식단 기록, 메모, 프로필 정보뿐 아니라 로그인 계정 자체도 함께 영구 삭제돼요.
        되돌릴 수 없고, 같은 이메일로 다시 가입해야 해요.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={`확인하려면 "${CONFIRM_WORD}"를 입력하세요`}
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
          {deleting ? "삭제 중..." : "영구 삭제"}
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
          취소
        </button>
      </div>
    </div>
  );
}
