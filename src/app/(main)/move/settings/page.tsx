import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { RoutineManager } from "@/components/workout/RoutineManager";
import { todayIsoDate } from "@/lib/body/date";
import { getCurrentUser } from "@/lib/supabase/server";
import { getRoutinesSafe } from "@/lib/workout/queries";

export default async function MoveSettingsPage() {
  const user = await getCurrentUser();
  const routines = user ? await getRoutinesSafe(user.id, todayIsoDate()) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/move"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">루틴 관리</h1>
      </div>

      <RoutineManager routines={routines} />
    </div>
  );
}
