import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { BodyCapture } from "@/components/body/BodyCapture";
import { BodyCompare } from "@/components/body/BodyCompare";
import { BodyTimeline } from "@/components/body/BodyTimeline";
import { todayIsoDate } from "@/lib/body/date";
import { getBodyEntriesSafe } from "@/lib/body/queries";
import { challengeDayNumber } from "@/lib/challenge/date";
import { getActiveChallengeSafe } from "@/lib/challenge/queries";
import { bodyLog } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

export default async function BodyPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entries = user ? await getBodyEntriesSafe(user.id) : [];
  const challenge = user ? await getActiveChallengeSafe(user.id) : null;
  const today = todayIsoDate();
  const currentDay = challenge ? Math.max(1, Math.min(100, challengeDayNumber(challenge.startDate, today))) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}>
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">눈바디</h1>
          {currentDay && <p className="font-en mt-0.5 text-[11px] font-semibold tracking-[0.08em] text-pink-500 uppercase">Day {currentDay} of 100</p>}
        </div>
      </div>

      {params.setup === "1" && (
        <section className="glass-card p-5">
          <p className="mb-1 text-[16px] font-bold text-text-primary">100일의 시작을 남겨주세요</p>
          <p className="text-[12px] leading-relaxed text-text-secondary">정면만 먼저 찍어도 괜찮아요. Day 1 사진은 이후 모든 변화 비교의 기준이 돼요.</p>
        </section>
      )}

      <p className="text-[11px] leading-relaxed text-text-disabled">몸 사진은 로그인한 본인만 볼 수 있도록 비공개로 저장돼요.</p>

      <BodyCapture entries={entries} weightKg={challenge?.startWeightKg ?? bodyLog.weightKg} challengeStartDate={challenge?.startDate} />
      <BodyCompare entries={entries} challengeStartDate={challenge?.startDate} />
      <BodyTimeline entries={entries} challengeStartDate={challenge?.startDate} />
    </div>
  );
}
