import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { DeleteAccountSection } from "@/components/my/DeleteAccountSection";
import { LogoutButton } from "@/components/my/LogoutButton";
import { MealWaterSettings } from "@/components/my/MealWaterSettings";
import { NotificationSettings } from "@/components/my/NotificationSettings";
import { ProfileHeader } from "@/components/my/ProfileHeader";
import { SettingsGroup, StaticRow } from "@/components/my/SettingsPrimitives";
import { InviteFriendSheet } from "@/components/together/InviteFriendSheet";
import { getBodyEntryCountSafe } from "@/lib/body/queries";
import { getFriendsTodaySafe, getMyFriendCode } from "@/lib/friends/queries";
import { getJournalCountSafe } from "@/lib/journal/queries";
import { profile } from "@/lib/mock-data";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMoveRecordCountSafe } from "@/lib/workout/queries";

export default async function MyPage() {
  const user = await getCurrentUser();

  const metadata = (user?.user_metadata ?? {}) as {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    language?: string;
    timezone?: string;
  };
  const displayName = metadata.display_name || user?.email?.split("@")[0] || profile.nickname;
  const avatarUrl = metadata.avatar_url ?? null;
  const bio = metadata.bio ?? null;
  const language = metadata.language || "ko";
  const timezone = metadata.timezone || "Asia/Seoul";
  const settings = readSettings(user?.user_metadata);

  // Independent reads — fetched together instead of one-after-another.
  const [myFriendCode, friends, bodyCount, moveCount, journalCount] = user
    ? await Promise.all([
        getMyFriendCode(user.id),
        getFriendsTodaySafe(),
        getBodyEntryCountSafe(user.id),
        getMoveRecordCountSafe(user.id),
        getJournalCountSafe(user.id),
      ])
    : [null, [], 0, 0, 0];

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader displayName={displayName} avatarUrl={avatarUrl} bio={bio} language={language} timezone={timezone} />

      <SettingsGroup title="나의 기록">
        <StaticRow label="Body 기록" value={`${bodyCount}개`} />
        <StaticRow label="Move 기록" value={`${moveCount}개`} />
        <StaticRow label="Journal 기록" value={`${journalCount}개`} />
        <Link href="/calendar" className="flex w-full items-center justify-between px-4 py-3.5 text-left">
          <span className="text-[13px] font-medium text-text-primary">기록 모아보기</span>
          <ChevronRightIcon className="h-3.5 w-3.5 text-text-muted" />
        </Link>
      </SettingsGroup>

      <SettingsGroup title="추가 기능">
        <MealWaterSettings settings={settings} />
        <NotificationSettings settings={settings} />
      </SettingsGroup>

      <InviteFriendSheet myCode={myFriendCode} friends={friends} />

      <SettingsGroup title="보안 및 계정">
        <StaticRow label="개인정보 안내" value="본인만 조회 가능" />
        <StaticRow label="사진 보안 안내" value="비공개 저장" />
        <div className="flex justify-center p-4">
          <LogoutButton />
        </div>
      </SettingsGroup>

      <div
        className="rounded-[var(--radius-lg)]"
        style={{ background: "var(--color-error-soft)", border: "1px solid rgba(203, 116, 128, 0.25)" }}
      >
        <DeleteAccountSection />
      </div>
    </div>
  );
}
