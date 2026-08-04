import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { ChangePasswordSection } from "@/components/my/ChangePasswordSection";
import { DeleteAccountSection } from "@/components/my/DeleteAccountSection";
import { LanguageRegionSettings } from "@/components/my/LanguageRegionSettings";
import { LogoutButton } from "@/components/my/LogoutButton";
import { MealWaterSettings } from "@/components/my/MealWaterSettings";
import { NotificationSettings } from "@/components/my/NotificationSettings";
import { SessionManagementSection } from "@/components/my/SessionManagementSection";
import { SettingsGroup, StaticRow } from "@/components/my/SettingsPrimitives";
import { InviteFriendSheet } from "@/components/together/InviteFriendSheet";
import { getFriendsTodaySafe, getMyFriendCode } from "@/lib/friends/queries";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MySettingsPage() {
  const user = await getCurrentUser();

  const metadata = (user?.user_metadata ?? {}) as {
    language?: string;
    country?: string;
    timezone?: string;
  };
  const language = metadata.language || "ko";
  const country = metadata.country || "KR";
  const timezone = metadata.timezone || "Asia/Seoul";
  const settings = readSettings(user?.user_metadata);

  // Independent reads — fetched together instead of one-after-another.
  const [myFriendCode, friends] = user
    ? await Promise.all([getMyFriendCode(user.id), getFriendsTodaySafe()])
    : [null, []];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/my"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">설정</h1>
      </div>

      <SettingsGroup title="사용 옵션">
        <MealWaterSettings settings={settings} />
      </SettingsGroup>

      <InviteFriendSheet myCode={myFriendCode} friends={friends} />

      <LanguageRegionSettings language={language} country={country} timezone={timezone} />

      <SettingsGroup title="알림">
        <NotificationSettings settings={settings} />
      </SettingsGroup>

      <SettingsGroup title="개인정보 및 보안">
        <StaticRow label="Body 사진 보안 안내" value="비공개 저장" />
        <ChangePasswordSection />
        <SessionManagementSection />
      </SettingsGroup>

      <SettingsGroup title="계정">
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
