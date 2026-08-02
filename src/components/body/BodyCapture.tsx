"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon, ScaleIcon } from "@/components/icons";
import { todayIsoDate } from "@/lib/body/date";
import { uploadBodyPhoto } from "@/lib/body/upload";
import type { BodyEntry, BodyPhotoSlot } from "@/lib/body/types";

const slots: { id: BodyPhotoSlot; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "back", label: "Back" },
];

/**
 * Capture UI for one day's Front/Side/Back photos. Defaults to today, but
 * the date picker lets you switch to any past day — useful for backfilling
 * old 눈바디 photos so they show up in Timeline/Compare. Selecting a photo
 * previews it immediately via an object URL, then uploads it to the
 * private `body-photos` bucket and upserts that day's body_entries row
 * (see src/lib/body/upload.ts). Isolated from Compare/Timeline so upload
 * behavior can change here without touching them.
 */
export function BodyCapture({
  entries,
  weightKg,
}: {
  entries: BodyEntry[];
  weightKg?: number;
}) {
  const router = useRouter();
  const today = todayIsoDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const entry = entries.find((e) => e.date === selectedDate) ?? null;

  const [previews, setPreviews] = useState<Record<BodyPhotoSlot, string | null>>({
    front: entry?.frontImageUrl ?? null,
    side: entry?.sideImageUrl ?? null,
    back: entry?.backImageUrl ?? null,
  });
  const [filled, setFilled] = useState<Record<BodyPhotoSlot, boolean>>({
    front: !!entry?.front,
    side: !!entry?.side,
    back: !!entry?.back,
  });
  const [uploading, setUploading] = useState<Partial<Record<BodyPhotoSlot, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<BodyPhotoSlot, string>>>({});
  const inputRefs = useRef<Partial<Record<BodyPhotoSlot, HTMLInputElement | null>>>({});

  // Re-sync local preview state whenever the selected date changes, or the
  // server gives us fresh `entries` after a router.refresh().
  useEffect(() => {
    setPreviews({
      front: entry?.frontImageUrl ?? null,
      side: entry?.sideImageUrl ?? null,
      back: entry?.backImageUrl ?? null,
    });
    setFilled({
      front: !!entry?.front,
      side: !!entry?.side,
      back: !!entry?.back,
    });
    setErrors({});
  }, [selectedDate, entry]);

  async function handleFile(slot: BodyPhotoSlot, file: File | undefined) {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [slot]: localUrl }));
    setFilled((prev) => ({ ...prev, [slot]: true }));
    setErrors((prev) => ({ ...prev, [slot]: undefined }));
    setUploading((prev) => ({ ...prev, [slot]: true }));

    try {
      await uploadBodyPhoto({ date: selectedDate, slot, file });
      router.refresh();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [slot]: err instanceof Error ? err.message : "업로드에 실패했어요.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [slot]: false }));
    }
  }

  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">Capture</p>
        {weightKg && (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <ScaleIcon className="h-[14px] w-[14px] text-pink-400" />
            {weightKg}kg
          </span>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value || today)}
          className="min-h-[36px] rounded-full px-3 text-[13px] font-semibold text-text-primary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        />
        {selectedDate !== today && (
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className="text-[11px] font-semibold text-pink-500"
          >
            오늘로
          </button>
        )}
        {selectedDate !== today && (
          <span className="font-en text-[11px] text-text-muted lowercase">지난 기록 추가 중</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot) => {
          const preview = previews[slot.id];
          const isFilled = filled[slot.id];
          const isUploading = uploading[slot.id];
          const error = errors[slot.id];
          return (
            <div key={slot.id} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => inputRefs.current[slot.id]?.click()}
                className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
                style={
                  isFilled
                    ? { background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }
                    : { background: "var(--surface-card)", border: "1px dashed rgba(86, 62, 58, 0.18)" }
                }
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={`${slot.label} 사진`} className="h-full w-full object-cover" />
                ) : (
                  <CameraIcon
                    className={isFilled ? "h-6 w-6 text-white/85" : "h-6 w-6 text-text-muted"}
                  />
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="font-en text-[10px] font-semibold text-white">저장 중...</span>
                  </div>
                )}
              </button>
              <span className="font-en text-[11px] font-semibold text-text-secondary lowercase">
                {slot.label}
              </span>
              <input
                ref={(el) => {
                  inputRefs.current[slot.id] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFile(slot.id, e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => inputRefs.current[slot.id]?.click()}
                className="text-[11px] font-semibold text-pink-500"
              >
                {isFilled ? "다시 촬영" : "촬영하기"}
              </button>
              {error && <span className="text-center text-[10px] text-error">{error}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
