import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { getBodyEntryByDateSafe } from "@/lib/body/queries";
import { SLOT_LABELS } from "@/lib/body/types";
import type { BodyPhotoSlot } from "@/lib/body/types";
import { getCurrentUser } from "@/lib/supabase/server";

const slots: BodyPhotoSlot[] = ["front", "side", "back"];

export default async function BodyEntryDetailPage(props: PageProps<"/body/[date]">) {
  const { date } = await props.params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const entry = await getBodyEntryByDateSafe(user.id, date);
  if (!entry) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/body"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">{entry.dateLabel}</h1>
      </div>

      <div className="glass-card flex flex-col gap-4 p-5">
        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot) => {
            const filled = entry[slot];
            const imageUrl =
              slot === "front" ? entry.frontImageUrl : slot === "side" ? entry.sideImageUrl : entry.backImageUrl;
            return (
              <div key={slot} className="flex flex-col items-center gap-2">
                <div
                  className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
                  style={
                    filled
                      ? { background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }
                      : { background: "var(--color-bg-warm)" }
                  }
                >
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={`${SLOT_LABELS[slot]} 사진`}
                      fill
                      sizes="(max-width: 480px) 30vw, 140px"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-text-secondary">{SLOT_LABELS[slot]}</span>
              </div>
            );
          })}
        </div>
        {entry.memo && <p className="text-[13px] leading-relaxed text-text-secondary">{entry.memo}</p>}
      </div>
    </div>
  );
}
