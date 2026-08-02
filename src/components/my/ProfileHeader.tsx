"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon } from "@/components/icons";
import { updateProfile } from "@/lib/profile/mutations";

export function ProfileHeader({
  displayName,
  avatarUrl,
  bio,
  heightCm,
  weightKg,
}: {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  heightCm: number | null;
  weightKg: number | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [bioInput, setBioInput] = useState(bio ?? "");
  const [heightInput, setHeightInput] = useState(heightCm != null ? String(heightCm) : "");
  const [weightInput, setWeightInput] = useState(weightKg != null ? String(weightKg) : "");
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
    setHeightInput(heightCm != null ? String(heightCm) : "");
    setWeightInput(weightKg != null ? String(weightKg) : "");
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
        heightCm: heightInput.trim() ? Number(heightInput) : null,
        weightKg: weightInput.trim() ? Number(weightInput) : null,
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
    const stats = [heightCm != null ? `${heightCm}cm` : null, weightKg != null ? `${weightKg}kg` : null]
      .filter(Boolean)
      .join(" · ");
    return (
      <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-4 text-left">
        <div
          className="h-16 w-16 shrink-0 overflow-hidden rounded-full"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="프로필 사진" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold tracking-[-0.02em] text-text-primary">{displayName}</p>
          {bio && <p className="mt-0.5 truncate text-[13px] text-text-secondary">{bio}</p>}
          {stats && <p className="mt-0.5 text-xs text-text-muted">{stats}</p>}
          <p className="mt-0.5 text-xs text-text-muted">프로필 편집</p>
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
          className="min-h-[44px] flex-1 rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
      </div>

      <input
        value={bioInput}
        onChange={(e) => setBioInput(e.target.value)}
        placeholder="한줄 멘트"
        maxLength={60}
        className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[13px] text-text-primary outline-none"
        style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={heightInput}
            onChange={(e) => setHeightInput(e.target.value)}
            type="number"
            inputMode="decimal"
            placeholder="키"
            className="min-h-[44px] w-full rounded-[var(--radius-md)] px-4 pr-10 text-[15px] text-text-primary outline-none"
            style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-text-muted">
            cm
          </span>
        </div>
        <div className="relative flex-1">
          <input
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            type="number"
            inputMode="decimal"
            placeholder="몸무게"
            className="min-h-[44px] w-full rounded-[var(--radius-md)] px-4 pr-10 text-[15px] text-text-primary outline-none"
            style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-text-muted">
            kg
          </span>
        </div>
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
