import Image from "next/image";
import { CameraIcon, PlusIcon } from "@/components/icons";
import { SLOT_LABELS } from "@/lib/body/types";
import type { BodyPhotoSlot } from "@/lib/body/types";

export function BodyThumb({
  slot,
  filled,
  imageUrl,
  size = 56,
  showLabel = true,
}: {
  slot: BodyPhotoSlot;
  filled: boolean;
  imageUrl?: string;
  size?: number;
  showLabel?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
        style={{
          width: size,
          height: size,
          background: filled
            ? "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))"
            : "var(--surface-card)",
          border: filled ? "none" : "1px dashed rgba(86, 62, 58, 0.18)",
          color: filled ? "var(--color-text-inverse)" : "var(--color-text-muted)",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${SLOT_LABELS[slot]} 사진`}
            fill
            sizes={`${size}px`}
            className="object-cover"
          />
        ) : filled ? (
          <CameraIcon className="h-1/2 w-1/2" />
        ) : (
          <PlusIcon className="h-1/3 w-1/3" />
        )}
      </div>
      {showLabel && <span className="text-[10px] font-semibold text-text-muted">{SLOT_LABELS[slot]}</span>}
    </div>
  );
}
