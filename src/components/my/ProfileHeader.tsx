"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CameraIcon, EditIcon } from "@/components/icons";
import { updateProfile } from "@/lib/profile/mutations";

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Seoul", label: "서울 (GMT+9)" },
  { value: "Asia/Tokyo", label: "도쿄 (GMT+9)" },
  { value: "America/Los_Angeles", label: "로스앤젤레스 (GMT-8)" },
  { value: "America/New_York", label: "뉴욕 (GMT-5)" },
  { value: "Europe/London", label: "런던 (GMT+0)" },
  { value: "Asia/Kuala_Lumpur", label: "쿠알라룸푸르 (GMT+8)" },
  { value: "Europe/Madrid", label: "마드리드 (GMT+1)" },
  { value: "Europe/Paris", label: "파리 (GMT+1)" },
  { value: "Asia/Jakarta", label: "자카르타 (GMT+7)" },
  { value: "Asia/Bangkok", label: "방콕 (GMT+7)" },
];

function languageLabel(value: string) {
  return LANGUAGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function timezoneLabel(value: string) {
  return TIMEZONE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function ProfileHeader({
  displayName,
  avatarUrl,
  bio,
  language,
  timezone,
}: {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  language: string;
  timezone: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [bioInput, setBioInput] = useState(bio ?? "");
  const [languageInput, setLanguageInput] = useState(language);
  const [timezoneInput, setTimezoneInput] = useState(timezone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    setLanguageInput(language);
    setTimezoneInput(timezone);
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
        language: languageInput,
        timezone: timezoneInput,
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
      <button type="button" onClick={() => setEditing(true)} className="flex min-h-[44px] items-center gap-4 text-left">
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          {avatarUrl && (
            <Image src={avatarUrl} alt="프로필 사진" fill sizes="64px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold tracking-[-0.02em] text-text-primary">{displayName}</p>
          {bio && <p className="mt-0.5 truncate text-[13px] text-text-secondary">{bio}</p>}
          <p className="mt-0.5 text-xs text-text-muted">
            {languageLabel(language)} · {timezoneLabel(timezone)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-pink-500">
            <EditIcon className="h-3 w-3" />
            프로필 편집
          </p>
        </div>
      </button>
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

      <input
        value={bioInput}
        onChange={(e) => setBioInput(e.target.value)}
        placeholder="한줄 소개"
        maxLength={60}
        className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[13px] text-text-primary outline-none"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      />

      <div className="flex gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-text-muted">언어</span>
          <select
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            className="min-h-[44px] w-full min-w-0 rounded-[var(--radius-md)] px-3 text-[13px] text-text-primary outline-none"
            style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-text-muted">시간대</span>
          <select
            value={timezoneInput}
            onChange={(e) => setTimezoneInput(e.target.value)}
            className="min-h-[44px] w-full min-w-0 rounded-[var(--radius-md)] px-3 text-[13px] text-text-primary outline-none"
            style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
          >
            {TIMEZONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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
