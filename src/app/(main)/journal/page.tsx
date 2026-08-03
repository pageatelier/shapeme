import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { JournalForm } from "@/components/journal/JournalForm";
import { JournalList } from "@/components/journal/JournalList";
import { isoDateInTimeZone } from "@/lib/body/date";
import { getJournalEntriesSafe, getJournalEntryByDateSafe } from "@/lib/journal/queries";
import { createClient } from "@/lib/supabase/server";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const timezone = (user?.user_metadata as { timezone?: string } | undefined)?.timezone || "Asia/Seoul";
  const todayIso = isoDateInTimeZone(new Date(), timezone);

  const todayEntry = user ? await getJournalEntryByDateSafe(user.id, todayIso) : null;
  const allEntries = user ? await getJournalEntriesSafe(user.id) : [];
  const pastEntries = allEntries.filter((e) => e.date !== todayIso);

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
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Journal</h1>
      </div>

      <JournalForm
        date={todayIso}
        initialMood={todayEntry?.mood ?? null}
        initialDayText={todayEntry?.dayText ?? ""}
        initialGoodThing={todayEntry?.goodThing ?? ""}
      />

      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">지난 기록</p>
        <JournalList entries={pastEntries} />
      </section>
    </div>
  );
}
