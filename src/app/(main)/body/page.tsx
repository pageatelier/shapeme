import { LockIcon } from "@/components/icons";
import { BodyView } from "@/components/body/BodyView";
import { bodyCopy } from "@/lib/copy/body";
import { isoDateInTimeZone } from "@/lib/body/date";
import { getBodyEntriesSafe } from "@/lib/body/queries";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function BodyPage() {
  const user = await getCurrentUser();
  const settings = readSettings(user?.user_metadata);
  const entries = user ? await getBodyEntriesSafe(user.id) : [];

  // Same fallback order as Today's Journey card, so "week N" means the same
  // thing on both pages.
  const startedAt = settings.programStartedAt ?? user?.created_at ?? isoDateInTimeZone();

  return (
    <div className="flex flex-col gap-6">
      <BodyView entries={entries} startedAt={startedAt} goalPeriod={settings.goalPeriod} />

      <p className="flex items-center gap-1.5 text-[11px] leading-relaxed text-text-secondary">
        <LockIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        {bodyCopy.header.privacyNote}
      </p>
    </div>
  );
}
