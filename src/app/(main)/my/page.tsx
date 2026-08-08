import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
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

      <Link
        href="/my/weekly-review"
        className="glass-card flex items-center justify-between gap-3 p-4"
      >
        <div>
          <p className="text-[13px] font-bold text-text-primary">이번 주 리뷰 보기 ⭐</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            잘한 점, 조정할 점, 그리고 다음 주 루틴까지 함께 확인해요.
          </p>
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-muted" />
      </Link>

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
