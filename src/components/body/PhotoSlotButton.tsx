"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";
import { deleteBodyPhoto, uploadBodyPhoto } from "@/lib/body/upload";
import { SLOT_LABELS } from "@/lib/body/types";
import type { BodyPhotoSlot } from "@/lib/body/types";
import { LiveCameraCapture } from "./LiveCameraCapture";

/**
 * One Front/Side/Back/Full slot: tap it (or "Choose photo") to open the
 * in-app live camera view (LiveCameraCapture) — chosen over the OS's native
 * `<input type="file">` picker specifically so the previous shot for this
 * slot can be overlaid on the live feed while framing the new one, which a
 * native camera app gives web pages no way to do. Capturing there uploads
 * immediately (the live overlay already confirmed alignment). The hidden
 * `<input>` below is the fallback path — reachable via "Choose from
 * library" inside the camera view, or automatically if the camera is
 * unavailable/denied — and keeps its own pre-upload alignment review
 * (there's no live guide for a gallery pick, so it's checked after instead).
 *
 * `emptyVariant="cta"` swaps the not-yet-filled state for a bigger inviting
 * card (BodyCapture's front slot) instead of the small dashed tile every
 * other slot uses — same upload logic either way, just a different empty
 * state; once filled, both variants render identically.
 */
export function PhotoSlotButton({
  slot,
  date,
  filled,
  imageUrl,
  previousImageUrl,
  emptyVariant = "tile",
}: {
  slot: BodyPhotoSlot;
  date: string;
  filled: boolean;
  imageUrl?: string;
  /** Most recent other entry's photo for this same slot, if any — enables
   * the live-camera overlay and the gallery-pick alignment review. */
  previousImageUrl?: string;
  emptyVariant?: "tile" | "cta";
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [isFilled, setIsFilled] = useState(filled);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  async function upload(file: File) {
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsFilled(true);
    setError(null);
    setUploading(true);
    try {
      await uploadBodyPhoto({ date, slot, file });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : bodyCopy.slot.uploadError);
    } finally {
      setUploading(false);
    }
  }

  function openGallery() {
    setCameraOpen(false);
    inputRef.current?.click();
  }

  function handleLiveCapture(file: File) {
    // Alignment was already visible live, via the overlay — no need for a
    // second static review step.
    setCameraOpen(false);
    upload(file);
  }

  function onGalleryFileSelected(file: File | undefined) {
    if (!file) return;
    if (previousImageUrl) {
      setPendingFile(file);
      setPendingPreview(URL.createObjectURL(file));
    } else {
      upload(file);
    }
  }

  function confirmPending() {
    if (!pendingFile) return;
    const file = pendingFile;
    setPendingFile(null);
    setPendingPreview(null);
    upload(file);
  }

  function retake() {
    setPendingFile(null);
    setPendingPreview(null);
    inputRef.current?.click();
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
      setError(err instanceof Error ? err.message : bodyCopy.slot.deleteError);
    } finally {
      setDeleting(false);
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => onGalleryFileSelected(e.target.files?.[0])}
    />
  );

  const camera = cameraOpen && (
    <LiveCameraCapture
      previousImageUrl={previousImageUrl}
      onCapture={handleLiveCapture}
      onCancel={() => setCameraOpen(false)}
      onUseGalleryInstead={openGallery}
    />
  );

  const reviewOverlay = pendingPreview && (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: "rgba(33, 31, 28, 0.92)" }}
    >
      <p className="text-[13px] font-semibold text-white">{bodyCopy.slot.compareTitle}</p>
      <div className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-[var(--radius-lg)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pendingPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {previousImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previousImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        )}
      </div>
      <p className="max-w-[260px] text-center text-[11px] leading-relaxed text-white/70">
        {bodyCopy.slot.compareHint}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={retake}
          className="rounded-full px-5 py-2.5 text-[12px] font-semibold text-white"
          style={{ border: "1px solid rgba(255,255,255,0.3)" }}
        >
          {bodyCopy.slot.retake}
        </button>
        <button
          type="button"
          onClick={confirmPending}
          className="rounded-full px-5 py-2.5 text-[12px] font-semibold"
          style={{ background: "var(--color-accent)", color: "var(--color-ink)" }}
        >
          {bodyCopy.slot.usePhoto}
        </button>
      </div>
    </div>
  );

  if (!isFilled && emptyVariant === "cta") {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="flex w-full flex-col items-center gap-3 rounded-[var(--radius-lg)] px-6 py-10 text-center"
          style={{ border: "1px dashed var(--glass-border)" }}
        >
          <CameraIcon className="h-6 w-6 text-text-muted" />
          <div>
            <p className="font-cormorant text-xl font-semibold text-text-primary">{bodyCopy.capture.title}</p>
            <p className="mt-1 text-[12px] text-text-secondary">{bodyCopy.capture.subtitle}</p>
          </div>
          <span
            className="font-en mt-1 rounded-full px-5 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-text-inverse"
            style={{ background: "var(--color-ink)" }}
          >
            {bodyCopy.capture.cta} →
          </span>
          {uploading && <span className="text-[11px] text-text-muted">{bodyCopy.slot.saving}</span>}
        </button>
        {input}
        {error && <span className="text-center text-[10px] text-error">{error}</span>}
        {camera}
        {reviewOverlay}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setCameraOpen(true)}
        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
        style={
          isFilled
            ? { background: "linear-gradient(160deg, var(--color-bg-warm), var(--color-pink-200))" }
            : { background: "var(--surface-card)", border: "1px dashed rgba(78, 59, 54, 0.18)" }
        }
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`${SLOT_LABELS[slot]} photo`} className="h-full w-full object-cover" />
        ) : (
          <CameraIcon className={isFilled ? "h-6 w-6 text-white/85" : "h-6 w-6 text-text-muted"} />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="text-[10px] font-semibold text-white">{bodyCopy.slot.saving}</span>
          </div>
        )}
      </button>
      <span className="text-[11px] font-semibold text-text-secondary">{SLOT_LABELS[slot]}</span>
      {input}
      {confirmingDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary">{bodyCopy.slot.confirmDelete}</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] font-semibold text-error disabled:opacity-60"
          >
            {deleting ? bodyCopy.slot.deleting : bodyCopy.slot.delete}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
            className="text-[11px] font-semibold text-text-muted disabled:opacity-60"
          >
            {bodyCopy.slot.cancel}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="text-[11px] font-semibold text-pink-500"
          >
            {isFilled ? bodyCopy.slot.change : bodyCopy.slot.choose}
          </button>
          {isFilled && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-[11px] font-semibold text-text-muted"
            >
              {bodyCopy.slot.delete}
            </button>
          )}
        </div>
      )}
      {error && <span className="text-center text-[10px] text-error">{error}</span>}
      {camera}
      {reviewOverlay}
    </div>
  );
}
