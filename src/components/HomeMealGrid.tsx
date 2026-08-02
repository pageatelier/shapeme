"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CameraIcon } from "@/components/icons";
import { uploadMealPhoto } from "@/lib/meal/mutations";
import type { MealLog } from "@/lib/meal/types";

export function HomeMealGrid({ meals }: { meals: MealLog[] }) {
  const router = useRouter();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [previews, setPreviews] = useState<Record<string, string | undefined>>(
    Object.fromEntries(meals.map((m) => [m.type, m.imageUrl])),
  );
  const [filledMap, setFilledMap] = useState<Record<string, boolean>>(
    Object.fromEntries(meals.map((m) => [m.type, m.filled])),
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(meal: MealLog, file: File | undefined) {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [meal.type]: localUrl }));
    setFilledMap((prev) => ({ ...prev, [meal.type]: true }));
    setError(null);
    setUploading(meal.type);
    try {
      await uploadMealPhoto({ date: meal.date, mealType: meal.type, file });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {meals.map((meal) => {
        const filled = filledMap[meal.type];
        const preview = previews[meal.type];
        return (
          <button
            key={meal.type}
            type="button"
            onClick={() => inputRefs.current[meal.type]?.click()}
            className="relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[16px]"
            style={
              filled
                ? {
                    background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))",
                    color: "var(--color-text-inverse)",
                    boxShadow: "var(--shadow-xs)",
                  }
                : {
                    background: "var(--surface-card)",
                    border: "1px dashed rgba(86, 62, 58, 0.16)",
                    color: "var(--color-text-muted)",
                  }
            }
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={`${meal.type} 사진`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <CameraIcon className="h-[18px] w-[18px]" />
                <span className="font-en text-[10px] font-semibold tracking-[0.04em] lowercase">
                  {meal.type}
                </span>
              </>
            )}
            {uploading === meal.type && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <span className="font-en text-[9px] font-semibold text-white">저장 중</span>
              </div>
            )}
            <input
              ref={(el) => {
                inputRefs.current[meal.type] = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(meal, e.target.files?.[0])}
            />
          </button>
        );
      })}
      {error && <p className="col-span-4 text-center text-[11px] text-error">{error}</p>}
    </div>
  );
}
