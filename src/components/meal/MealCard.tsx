"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon, PlusIcon } from "@/components/icons";
import { updateMealFullness, uploadMealPhoto } from "@/lib/meal/mutations";
import { FULLNESS_OPTIONS, MEAL_TITLES } from "@/lib/meal/types";
import type { Fullness, MealLog } from "@/lib/meal/types";

export function MealCard({ meal }: { meal: MealLog }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(meal.imageUrl ?? null);
  const [filled, setFilled] = useState(meal.filled);
  const [fullness, setFullness] = useState<Fullness | undefined>(meal.fullness);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setFilled(true);
    setError(null);
    setUploading(true);
    try {
      await uploadMealPhoto({ date: meal.date, mealType: meal.type, file });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
  }

  async function handleFullness(value: Fullness) {
    setFullness(value);
    try {
      await updateMealFullness({ date: meal.date, mealType: meal.type, fullness: value });
      router.refresh();
    } catch {
      // non-critical — leave the optimistic value even if the save failed
    }
  }

  return (
    <div className={filled ? "glass-card p-5" : "surface-card p-5"}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-en text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
          {meal.type}
        </span>
        <span className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">
          {MEAL_TITLES[meal.type]}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
          style={
            filled
              ? { background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }
              : { border: "1px dashed rgba(78, 59, 54, 0.18)" }
          }
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={`${MEAL_TITLES[meal.type]} 사진`} className="h-full w-full object-cover" />
          ) : filled ? (
            <CameraIcon className="h-6 w-6 text-white/85" />
          ) : (
            <PlusIcon className="h-4 w-4 text-text-muted" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="font-en text-[9px] font-semibold text-white">저장 중</span>
            </div>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {filled ? (
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {FULLNESS_OPTIONS.map((option) => {
                const active = fullness === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleFullness(option)}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={
                      active
                        ? { background: "var(--gradient-primary)", color: "var(--color-text-inverse)" }
                        : { background: "rgba(255,255,255,0.6)", color: "var(--color-text-secondary)", border: "var(--border-soft)" }
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-w-0 flex-1 items-center text-[13px] font-semibold text-text-muted"
          >
            사진 추가
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-[11px] text-error">{error}</p>}
    </div>
  );
}
