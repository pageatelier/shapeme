import Link from "next/link";
import { CameraIcon } from "@/components/icons";
import { BodyThumb } from "@/components/body/BodyThumb";
import type { BodyEntry } from "@/lib/body/types";

export function TodayBodyCard({ entry }: { entry: BodyEntry | null }) {
  const hasAny = !!entry && (entry.front || entry.side || entry.back);

  return (
    <div className="glass-card p-6">
      <p className="font-en mb-4 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
        today&apos;s body
      </p>

      {!hasAny || !entry ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(160deg, var(--color-lilac), var(--color-rose-mist))" }}
          >
            <CameraIcon className="h-6 w-6 text-white/85" />
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            오늘의 나를 기록해보세요.
          </p>
          <Link
            href="/body"
            className="flex min-h-[44px] w-full items-center justify-center rounded-full text-[13px] font-bold text-text-inverse"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
          >
            촬영하기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-around">
            <BodyThumb slot="front" filled={entry.front} imageUrl={entry.frontImageUrl} />
            <BodyThumb slot="side" filled={entry.side} imageUrl={entry.sideImageUrl} />
            <BodyThumb slot="back" filled={entry.back} imageUrl={entry.backImageUrl} />
          </div>
          <Link
            href="/body"
            className="flex min-h-[44px] w-full items-center justify-center rounded-full text-[13px] font-bold text-text-primary"
            style={{ background: "rgba(255,255,255,0.76)", border: "var(--border-soft)" }}
          >
            기록 보기
          </Link>
        </div>
      )}
    </div>
  );
}
