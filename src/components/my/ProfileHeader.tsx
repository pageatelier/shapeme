"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CameraIcon, EditIcon, SettingsIcon } from "@/components/icons";
import { isoDateInTimeZone } from "@/lib/body/date";
import { updateProfile } from "@/lib/profile/mutations";

export function ProfileHeader({
  displayName,
  avatarUrl,
  bio,
  monthlyGoal,
  timezone,
}: {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  monthlyGoal: string | null;
  timezone: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [bioInput, setBioInput] = useState(bio ?? "");
  const [goalInput, setGoalInput] = useState(monthlyGoal ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentMonth = Number(isoDateInTimeZone(new Date(), timezone).slice(5, 7));

  function handlePickFile(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function cancel() {
    setEditing(false);
    setName(displayName);
    setPreview(avatarUrl);
    setFile(null);
    setBioInput(bio ?? "");
    setGoalInput(monthlyGoal ?? "");
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        displayName: name.trim() || undefined,
        avatarFile: file ?? undefined,
        bio: bioInput.trim(),
        monthlyGoal: goalInput.trim(),
      });
      router.refresh();
      setEditing(false);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => setEditing(true)} className="flex min-h-[44px] flex-1 items-center gap-4 text-left">
          <div
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
          >
            {avatarUrl && <Image src={avatarUrl} alt="프로필 사진" fill sizes="64px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tracking-[-0.02em] text-text-primary">{displayName}</p>
            <p className="mt-0.5 truncate text-[13px] text-text-secondary">
              {bio || <span className="text-text-disabled">나를 위한 한마디를 남겨보세요</span>}
            </p>
            <p className="mt-0.5 truncate text-xs text-text-muted">
              {currentMonth}월의 작은 목표 ·{" "}
              {monthlyGoal || <span className="text-text-disabled">아직 없어요</span>}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-pink-500">
              <EditIcon className="h-3 w-3" />
              프로필 편집
            </p>
          </div>
        </button>
        <Link
          href="/my/settings"
          aria-label="설정"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <SettingsIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{ background: "var(--gradient-primary)" }}
          aria-label="프로필 사진 변경"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="프로필 사진 미리보기" className="h-full w-full object-cover" />
          ) : (
            <CameraIcon className="h-6 w-6 text-white/85" />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePickFile(e.target.files?.[0])}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="닉네임"
          className="min-h-[44px] min-w-0 flex-1 rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-muted">나를 위한 한마디</span>
        <input
          value={bioInput}
          onChange={(e) => setBioInput(e.target.value)}
          placeholder="한줄 소개"
          maxLength={60}
          className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[13px] text-text-primary outline-none"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-muted">{currentMonth}월의 작은 목표</span>
        <input
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="이번 달, 나에게 해주고 싶은 것"
          maxLength={60}
          className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[13px] text-text-primary outline-none"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
      </label>

      {error && <p className="text-[12px] text-error">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="min-h-[40px] flex-1 rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          취소
        </button>
      </div>
    </div>
  );
}
