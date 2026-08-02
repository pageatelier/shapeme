import { DataExportButtons } from "@/components/my/DataExportButtons";
import { DeleteAccountSection } from "@/components/my/DeleteAccountSection";
import { DisplaySettings } from "@/components/my/DisplaySettings";
import { GoalsSettings } from "@/components/my/GoalsSettings";
import { LogoutButton } from "@/components/my/LogoutButton";
import { ProfileHeader } from "@/components/my/ProfileHeader";
import { RoutineSettings } from "@/components/my/RoutineSettings";
import { SettingsGroup, StaticRow } from "@/components/my/SettingsPrimitives";
import { profile } from "@/lib/mock-data";
import { readSettings } from "@/lib/settings/types";
import { createClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = (user?.user_metadata ?? {}) as {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    height_cm?: number;
    weight_kg?: number;
  };
  const displayName = metadata.display_name || user?.email?.split("@")[0] || profile.nickname;
  const avatarUrl = metadata.avatar_url ?? null;
  const bio = metadata.bio ?? null;
  const heightCm = metadata.height_cm ?? null;
  const weightKg = metadata.weight_kg ?? null;
  const settings = readSettings(user?.user_metadata);

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        bio={bio}
        heightCm={heightCm}
        weightKg={weightKg}
      />

      <GoalsSettings settings={settings} />

      <RoutineSettings settings={settings} />

      <SettingsGroup title="사진 및 데이터">
        <StaticRow label="사진 공개 범위" value="비공개" />
        <DataExportButtons />
        <DeleteAccountSection />
      </SettingsGroup>

      <SettingsGroup title="화면 설정">
        <DisplaySettings settings={settings} />
      </SettingsGroup>

      <div className="flex flex-col items-center gap-2 pt-2 pb-2 text-xs text-text-muted">
        <div className="flex gap-4">
          <span>개인정보 처리방침</span>
          <span>이용약관</span>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
