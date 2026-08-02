import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { LogoutButton } from "@/components/my/LogoutButton";
import { ProfileHeader } from "@/components/my/ProfileHeader";
import { ToggleRow } from "@/components/my/ToggleRow";
import { todayIsoDate } from "@/lib/body/date";
import { challengeDayNumber } from "@/lib/challenge/date";
import { getActiveChallengeSafe } from "@/lib/challenge/queries";
import { GOAL_LABELS } from "@/lib/challenge/types";
import { profile } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

function SettingsRow({ label, value, danger, href }: { label: string; value?: string; danger?: boolean; href?: string }) {
  const className = "flex w-full items-center justify-between px-4 py-3.5 text-left";
  const content = (
    <>
      <span className="text-[13px] font-medium" style={{ color: danger ? "var(--color-error)" : "var(--color-text-primary)" }}>{label}</span>
      <span className="flex items-center gap-1.5 text-xs text-text-muted">{value}<ChevronRightIcon className="h-3.5 w-3.5" /></span>
    </>
  );
  return href ? <Link href={href} className={className}>{content}</Link> : <button type="button" className={className}>{content}</button>;
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section><p className="mb-2 px-1 text-[13px] font-bold text-text-secondary">{title}</p><div className="surface-card divide-y" style={{ borderColor: "rgba(86,62,58,0.07)" }}>{children}</div></section>;
}

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = (user?.user_metadata ?? {}) as { display_name?: string; avatar_url?: string };
  const displayName = metadata.display_name || user?.email?.split("@")[0] || profile.nickname;
  const avatarUrl = metadata.avatar_url ?? null;
  const challenge = user ? await getActiveChallengeSafe(user.id) : null;
  const today = todayIsoDate();
  const day = challenge ? Math.max(1, Math.min(100, challengeDayNumber(challenge.startDate, today))) : null;

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader displayName={displayName} avatarUrl={avatarUrl} />

      {challenge ? (
        <section className="glass-card p-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="font-en mb-1 text-[10px] font-semibold tracking-[0.12em] text-pink-500 uppercase">My 100 days</p>
              <p className="font-en text-[30px] font-semibold tracking-[-0.06em] text-text-primary">Day {day}</p>
            </div>
            <span className="text-[12px] font-semibold text-text-muted">{day}%</span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}><div className="h-full rounded-full" style={{ width: `${day}%`, background: "var(--gradient-primary)" }} /></div>
          <p className="text-[13px] font-bold text-text-primary">{GOAL_LABELS[challenge.goal]}</p>
          <p className="mt-1 text-[12px] text-text-secondary">주 {challenge.workoutDaysPerWeek}회 · 회당 {challenge.sessionMinutes}분</p>
        </section>
      ) : (
        <Link href="/start" className="glass-card block p-6"><p className="mb-1 text-[16px] font-bold text-text-primary">100일 프로그램을 시작해보세요</p><p className="text-[12px] text-text-secondary">목표와 운동 환경을 등록하면 고정 루틴을 만들어드려요.</p></Link>
      )}

      <SettingsGroup title="나의 100일 챌린지">
        <SettingsRow label="현재 목표" value={challenge ? GOAL_LABELS[challenge.goal] : "설정 전"} href="/start" />
        <SettingsRow label="시작 체중" value={challenge?.startWeightKg ? `${challenge.startWeightKg}kg` : "설정 안 함"} />
        <SettingsRow label="주간 운동 목표" value={challenge ? `주 ${challenge.workoutDaysPerWeek}회` : "설정 전"} />
        <SettingsRow label="운동 시간" value={challenge ? `약 ${challenge.sessionMinutes}분` : "설정 전"} />
        <SettingsRow label="100일 프로그램 보기" href="/workout" />
      </SettingsGroup>

      <SettingsGroup title="사진 및 기록">
        <SettingsRow label="눈바디 타임라인" href="/body" />
        <SettingsRow label="사진 공개 범위" value="비공개" />
        <SettingsRow label="운동 기록 캘린더" href="/calendar" />
        <SettingsRow label="기록 내보내기" value="준비 중" />
      </SettingsGroup>

      <SettingsGroup title="알림 및 화면">
        <ToggleRow label="운동 알림 받기" defaultOn />
        <ToggleRow label="응원 메시지 표시" defaultOn />
        <ToggleRow label="다크 모드" />
      </SettingsGroup>

      <SettingsGroup title="프로그램 관리">
        <SettingsRow label="새로운 100일 시작" value="기존 프로그램 보관" href="/start" />
        <SettingsRow label="계정 데이터 삭제" danger />
      </SettingsGroup>

      <div className="flex flex-col items-center gap-2 pt-2 pb-2 text-xs text-text-muted">
        <div className="flex gap-4"><span>개인정보 처리방침</span><span>이용약관</span></div>
        <LogoutButton />
      </div>
    </div>
  );
}
