"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { updateSettings } from "@/lib/settings/mutations";
import type { Settings, WeekStartDay } from "@/lib/settings/types";
import { EditActions, LabeledInput, LabeledSelect, SettingsGroup, StaticRow } from "./SettingsPrimitives";

const WEEK_START_LABEL: Record<WeekStartDay, string> = { sun: "일요일", mon: "월요일" };

export function RoutineSettings({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cupMl, setCupMl] = useState(String(settings.cupMl));
  const [notificationTime, setNotificationTime] = useState(settings.notificationTime ?? "");
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>(settings.weekStartDay);

  function cancel() {
    setCupMl(String(settings.cupMl));
    setNotificationTime(settings.notificationTime ?? "");
    setWeekStartDay(settings.weekStartDay);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateSettings({
        cupMl: Number(cupMl) || 0,
        notificationTime: notificationTime || null,
        weekStartDay,
      });
      router.refresh();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[13px] font-bold text-text-secondary">루틴 및 기록 설정</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[11px] font-semibold text-text-muted"
          >
            편집
          </button>
        </div>
        <div className="surface-card divide-y divide-[rgba(78,59,54,0.07)]">
          <Link href="/workout" className="flex w-full items-center justify-between px-4 py-3.5 text-left">
            <span className="text-[13px] font-medium text-text-primary">운동 루틴 관리</span>
            <ChevronRightIcon className="h-3.5 w-3.5 text-text-muted" />
          </Link>
          <StaticRow label="물 한 잔 용량" value={`${settings.cupMl}ml`} />
          <StaticRow label="식사 항목 설정" value="아침·점심·저녁·간식" />
          <StaticRow label="알림 시간 설정" value={settings.notificationTime ?? "설정 안 함"} />
          <StaticRow label="한 주 시작 요일" value={WEEK_START_LABEL[settings.weekStartDay]} />
        </div>
      </section>
    );
  }

  return (
    <SettingsGroup title="루틴 및 기록 설정 편집">
      <div className="flex flex-col gap-4 p-4">
        <LabeledInput label="물 한 잔 용량" type="number" suffix="ml" value={cupMl} onChange={setCupMl} />
        <LabeledInput label="알림 시간 설정" type="time" value={notificationTime} onChange={setNotificationTime} />
        <LabeledSelect
          label="한 주 시작 요일"
          value={weekStartDay}
          onChange={(v) => setWeekStartDay(v as WeekStartDay)}
          options={[
            { value: "sun", label: "일요일" },
            { value: "mon", label: "월요일" },
          ]}
        />
        <p className="text-[11px] leading-relaxed text-text-disabled">
          식사 항목(아침·점심·저녁·간식)은 현재 고정되어 있어요.
        </p>
        <EditActions saving={saving} error={error} onSave={save} onCancel={cancel} />
      </div>
    </SettingsGroup>
  );
}
