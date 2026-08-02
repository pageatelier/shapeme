import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { BodyCapture } from "@/components/body/BodyCapture";
import { BodyCompare } from "@/components/body/BodyCompare";
import { BodyTimeline } from "@/components/body/BodyTimeline";
import { getBodyEntriesSafe } from "@/lib/body/queries";
import { bodyLog } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

export default async function BodyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entries = user ? await getBodyEntriesSafe(user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">눈바디</h1>
      </div>

      <p className="text-[11px] leading-relaxed text-text-disabled">
        몸 사진은 로그인한 본인만 볼 수 있도록 비공개로 저장돼요.
      </p>

      <BodyCapture entries={entries} weightKg={bodyLog.weightKg} />
      <BodyCompare entries={entries} />
      <BodyTimeline entries={entries} />
    </div>
  );
}
