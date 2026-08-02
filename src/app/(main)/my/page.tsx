import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { LogoutButton } from "@/components/my/LogoutButton";
import { ProfileHeader } from "@/components/my/ProfileHeader";
import { ToggleRow } from "@/components/my/ToggleRow";
import { profile } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

function SettingsRow({
  label,
  value,
  danger,
}: {
  label: string;
  value?: string;
  danger?: boolean;
}) {
  return (
    <button type="button" className="flex w-full items-center justify-between px-4 py-3.5 text-left">
      <span
        className="text-[13px] font-medium"
        style={{ color: danger ? "var(--color-error)" : "var(--color-text-primary)" }}
      >
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-text-muted">
        {value}
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 px-1 text-[13px] font-bold text-text-secondary">{title}</p>
      <div className="surface-card divide-y" style={{ borderColor: "rgba(86,62,58,0.07)" }}>
        {children}
      </div>
    </section>
  );
}

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

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        bio={bio}
        heightCm={heightCm}
        weightKg={weightKg}
      />

      <SettingsGroup title="나의 목표">
        <SettingsRow
          label="목표 체중 (선택)"
          value={profile.goalWeightKg ? `${profile.goalWeightKg}kg` : "설정 안 함"}
        />
        <SettingsRow label="하루 물 섭취 목표" value={`${profile.waterGoalMl.toLocaleString()}ml`} />
        <SettingsRow label="주간 운동 목표" value={`주 ${profile.weeklyWorkoutGoal}회`} />
        <SettingsRow label="집중하고 싶은 부위" value={profile.focusArea} />
        <SettingsRow label="목표 기간" value={profile.goalPeriod} />
      </SettingsGroup>

      <SettingsGroup title="루틴 및 기록 설정">
        <SettingsRow label="운동 루틴 관리" />
        <SettingsRow label="물 한 잔 용량" value="250ml" />
        <SettingsRow label="식사 항목 설정" value="아침·점심·저녁·간식" />
        <SettingsRow label="알림 시간 설정" />
        <SettingsRow label="한 주 시작 요일" value="일요일" />
      </SettingsGroup>

      <SettingsGroup title="사진 및 데이터">
        <SettingsRow label="사진 공개 범위" value="비공개" />
        <SettingsRow label="데이터 백업" />
        <SettingsRow label="기록 내보내기" />
        <SettingsRow label="계정 데이터 삭제" danger />
      </SettingsGroup>

      <SettingsGroup title="화면 설정">
        <ToggleRow label="다크 모드" />
        <ToggleRow label="알림 받기" defaultOn />
        <ToggleRow label="Self Love Message 표시" defaultOn />
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
