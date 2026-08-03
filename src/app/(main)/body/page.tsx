import { LockIcon } from "@/components/icons";
import { BodyCapture } from "@/components/body/BodyCapture";
import { BodyCompare } from "@/components/body/BodyCompareLazy";
import { BodyTimeline } from "@/components/body/BodyTimeline";
import { getBodyEntriesSafe } from "@/lib/body/queries";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function BodyPage() {
  const user = await getCurrentUser();

  const entries = user ? await getBodyEntriesSafe(user.id) : [];
  const weightKg = (user?.user_metadata as { weight_kg?: number } | undefined)?.weight_kg ?? null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Body</h1>

      <p className="flex items-center gap-1.5 text-[11px] leading-relaxed text-text-secondary">
        <LockIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        몸 사진은 로그인한 본인만 볼 수 있도록 비공개로 저장돼요.
      </p>

      <BodyCapture entries={entries} weightKg={weightKg} />
      <BodyCompare entries={entries} />
      <BodyTimeline entries={entries} weightKg={weightKg} />
    </div>
  );
}
