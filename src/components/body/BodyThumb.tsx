import { CameraIcon, PlusIcon } from "@/components/icons";
import type { BodyPhotoSlot } from "@/lib/body/types";

const slotLabel: Record<BodyPhotoSlot, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
};

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
        className="flex items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
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
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`${slotLabel[slot]} 사진`} className="h-full w-full object-cover" />
        ) : filled ? (
          <CameraIcon className="h-1/2 w-1/2" />
        ) : (
          <PlusIcon className="h-1/3 w-1/3" />
        )}
      </div>
      {showLabel && (
        <span className="font-en text-[10px] font-semibold text-text-muted lowercase">
          {slotLabel[slot]}
        </span>
      )}
    </div>
  );
}
