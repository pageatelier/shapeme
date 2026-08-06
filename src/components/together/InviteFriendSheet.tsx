"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toast } from "@/components/Toast";
import { addFriendByCode, removeFriend } from "@/lib/friends/mutations";
import type { FriendCard } from "@/lib/friends/types";
import { SettingsGroup } from "@/components/my/SettingsPrimitives";

export function InviteFriendSheet({ myCode, friends }: { myCode: string | null; friends: FriendCard[] }) {
  const router = useRouter();
  const [codeInput, setCodeInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!myCode) return;
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setAddError("복사에 실패했어요. 직접 선택해서 복사해주세요.");
    }
  }

  async function handleAdd() {
    if (!codeInput.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const { displayName } = await addFriendByCode(codeInput);
      setCodeInput("");
      setToast(`${displayName}님을 친구로 추가했어요.`);
      router.refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "친구 추가에 실패했어요.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(friendId: string) {
    setRemoving(true);
    try {
      await removeFriend(friendId);
      setConfirmRemoveId(null);
      setToast("친구를 삭제했어요.");
      router.refresh();
    } catch {
      setAddError("삭제에 실패했어요.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <SettingsGroup title="친구 및 초대">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-text-muted">내 초대 코드</p>
          <div className="flex gap-2">
            <div
              className="font-en flex min-h-[44px] flex-1 items-center rounded-[var(--radius-md)] px-4 text-[15px] font-semibold tracking-[0.05em] text-text-primary"
              style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
            >
              {myCode ?? "생성 중..."}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!myCode}
              className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[13px] font-semibold disabled:opacity-60"
              style={
                copied
                  ? { background: "var(--color-success-soft)", color: "var(--color-success)", border: "1px solid transparent" }
                  : { background: "var(--surface-card)", color: "var(--color-text-secondary)", border: "var(--border-soft)" }
              }
            >
              {copied ? "복사됨 ✓" : "코드 복사"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-text-muted">친구 코드 입력</p>
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="SHAPE-XXXXXX"
              className="font-en min-h-[44px] flex-1 rounded-[var(--radius-md)] px-4 text-[15px] tracking-[0.05em] text-text-primary outline-none"
              style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || !codeInput.trim()}
              className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[13px] font-bold text-text-inverse disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {adding ? "추가 중..." : "친구 추가"}
            </button>
          </div>
          {addError && <p className="mt-1.5 text-[11px] text-error">{addError}</p>}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-text-muted">친구 목록</p>
          {friends.length === 0 ? (
            <p className="text-[12px] text-text-disabled">아직 친구가 없어요.</p>
          ) : (
            <div className="surface-card divide-y divide-[rgba(78,59,54,0.07)]">
              {friends.map((friend) => (
                <div key={friend.friendId} className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {friend.avatarUrl && (
                          <Image src={friend.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-text-primary">{friend.displayName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmRemoveId(friend.friendId)}
                      className="text-[12px] font-semibold text-text-muted"
                    >
                      삭제
                    </button>
                  </div>

                  {confirmRemoveId === friend.friendId && (
                    <div className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] p-2.5" style={{ background: "var(--color-error-soft)" }}>
                      <span className="text-[11px] text-text-secondary">이 친구를 삭제할까요?</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemove(friend.friendId)}
                          disabled={removing}
                          className="rounded-full px-3 py-1 text-[11px] font-bold text-text-inverse disabled:opacity-60"
                          style={{ background: "var(--color-error)" }}
                        >
                          삭제
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          disabled={removing}
                          className="rounded-full px-3 py-1 text-[11px] font-semibold text-text-secondary"
                          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </SettingsGroup>
  );
}
