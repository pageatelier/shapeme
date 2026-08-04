import { MyRecordsCalendar } from "@/components/my/MyRecordsCalendar";
import { ProfileHeader } from "@/components/my/ProfileHeader";
import { isoDateInTimeZone } from "@/lib/body/date";
import { profile } from "@/lib/mock-data";
import { getMyRecordDetailAction } from "@/lib/records/actions";
import { getMyRecordsMonthSafe } from "@/lib/records/queries";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MyPage() {
  const user = await getCurrentUser();

  const metadata = (user?.user_metadata ?? {}) as {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    monthly_goal?: string;
    timezone?: string;
  };
  const displayName = metadata.display_name || user?.email?.split("@")[0] || profile.nickname;
  const avatarUrl = metadata.avatar_url ?? null;
  const bio = metadata.bio ?? null;
  const monthlyGoal = metadata.monthly_goal ?? null;
  const timezone = metadata.timezone || "Asia/Seoul";
  const settings = readSettings(user?.user_metadata);

  const todayIso = isoDateInTimeZone(new Date(), timezone);
  const [year, month] = todayIso.split("-").map(Number);

  // Independent reads — fetched together instead of one-after-another.
  const [initialDays, initialDetail] = user
    ? await Promise.all([
        getMyRecordsMonthSafe(user.id, year, month, settings),
        getMyRecordDetailAction(todayIso),
      ])
    : [[], null];

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader displayName={displayName} avatarUrl={avatarUrl} bio={bio} monthlyGoal={monthlyGoal} timezone={timezone} />

      <MyRecordsCalendar
        initialYear={year}
        initialMonth={month}
        initialDays={initialDays}
        initialDetail={initialDetail}
        todayIso={todayIso}
        weekStartDay={settings.weekStartDay}
      />
    </div>
  );
}
