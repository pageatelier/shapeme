import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { WaterView } from "@/components/water/WaterView";
import { todayIsoDate } from "@/lib/body/date";
import { water as waterMock } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { getWaterLogsSafe } from "@/lib/water/queries";

export default async function WaterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { entries, totalMl } = user
    ? await getWaterLogsSafe(user.id, todayIsoDate())
    : { entries: [], totalMl: 0 };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">물 마시기</h1>
      </div>

      <WaterView entries={entries} totalMl={totalMl} goalMl={waterMock.goalMl} />
    </div>
  );
}
