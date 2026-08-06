"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon } from "@/components/icons";
import { deleteBodyPhoto, uploadBodyPhoto } from "@/lib/body/upload";
import { SLOT_LABELS } from "@/lib/body/types";
import type { BodyPhotoSlot } from "@/lib/body/types";

/**
 * One Front/Side/Back tile: tap it (or "사진 선택") to open the OS's native
 * picker, which offers both "take a photo" and "choose from library" — no
 * `capture` attribute here on purpose, since that forces the camera open
 * directly and hides the gallery/upload option. Uploads immediately on
 * selection via uploadBodyPhoto and refreshes the page's server data.
 * Shared by TodayBodyCard (always today) and BodyCapture (any date).
 */
export function PhotoSlotButton({
  slot,
  date,
  filled,
  imageUrl,
}: {
  slot: BodyPhotoSlot;
  date: string;
  filled: boolean;
  imageUrl?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [isFilled, setIsFilled] = useState(filled);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsFilled(true);
    setError(null);
    setUploading(true);
    try {
      await uploadBodyPhoto({ date, slot, file });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteBodyPhoto({ date, slot });
      setPreview(null);
      setIsFilled(false);
      setConfirmingDelete(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
        style={
          isFilled
            ? { background: "linear-gradient(160deg, var(--color-bg-warm), var(--color-pink-200))" }
            : { background: "var(--surface-card)", border: "1px dashed rgba(78, 59, 54, 0.18)" }
        }
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`${SLOT_LABELS[slot]} 사진`} className="h-full w-full object-cover" />
        ) : (
          <CameraIcon className={isFilled ? "h-6 w-6 text-white/85" : "h-6 w-6 text-text-muted"} />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="text-[10px] font-semibold text-white">저장 중...</span>
          </div>
        )}
      </button>
      <span className="text-[11px] font-semibold text-text-secondary">{SLOT_LABELS[slot]}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {confirmingDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary">삭제할까요?</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] font-semibold text-error disabled:opacity-60"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
            className="text-[11px] font-semibold text-text-muted disabled:opacity-60"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[11px] font-semibold text-pink-500"
          >
            {isFilled ? "사진 변경" : "사진 선택"}
          </button>
          {isFilled && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-[11px] font-semibold text-text-muted"
            >
              삭제
            </button>
          )}
        </div>
      )}
      {error && <span className="text-center text-[10px] text-error">{error}</span>}
    </div>
  );
}
