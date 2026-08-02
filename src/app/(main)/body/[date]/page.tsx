import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { getBodyEntriesSafe } from "@/lib/body/queries";
import type { BodyPhotoSlot } from "@/lib/body/types";
import { createClient } from "@/lib/supabase/server";

const slots: { id: BodyPhotoSlot; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "back", label: "Back" },
];

export default async function BodyEntryDetailPage(props: PageProps<"/body/[date]">) {
  const { date } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const entries = await getBodyEntriesSafe(user.id);
  const entry = entries.find((e) => e.date === date);
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
            const filled = entry[slot.id];
            const imageUrl =
              slot.id === "front"
                ? entry.frontImageUrl
                : slot.id === "side"
                  ? entry.sideImageUrl
                  : entry.backImageUrl;
            return (
              <div key={slot.id} className="flex flex-col items-center gap-2">
                <div
                  className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
                  style={
                    filled
                      ? { background: "linear-gradient(160deg, var(--color-peach-200), var(--color-pink-200))" }
                      : { background: "var(--color-bg-warm)" }
                  }
                >
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={`${slot.label} 사진`} className="h-full w-full object-cover" />
                  )}
                </div>
                <span className="font-en text-[11px] font-semibold text-text-secondary lowercase">
                  {slot.label}
                </span>
              </div>
            );
          })}
        </div>
        {entry.memo && <p className="text-[13px] leading-relaxed text-text-secondary">{entry.memo}</p>}
      </div>
    </div>
  );
}
