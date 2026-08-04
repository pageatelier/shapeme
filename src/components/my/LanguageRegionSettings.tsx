"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProfile } from "@/lib/profile/mutations";
import { LabeledSelect, SettingsGroup } from "./SettingsPrimitives";

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

const COUNTRY_OPTIONS = [
  { value: "KR", label: "대한민국" },
  { value: "JP", label: "일본" },
  { value: "US", label: "미국" },
  { value: "GB", label: "영국" },
  { value: "MY", label: "말레이시아" },
  { value: "ES", label: "스페인" },
  { value: "FR", label: "프랑스" },
  { value: "ID", label: "인도네시아" },
  { value: "TH", label: "태국" },
  { value: "OTHER", label: "기타" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Seoul", label: "서울 (GMT+9)" },
  { value: "Asia/Tokyo", label: "도쿄 (GMT+9)" },
  { value: "America/Los_Angeles", label: "로스앤젤레스 (GMT-8)" },
  { value: "America/New_York", label: "뉴욕 (GMT-5)" },
  { value: "Europe/London", label: "런던 (GMT+0)" },
  { value: "Asia/Kuala_Lumpur", label: "쿠알라룸푸르 (GMT+8)" },
  { value: "Europe/Madrid", label: "마드리드 (GMT+1)" },
  { value: "Europe/Paris", label: "파리 (GMT+1)" },
  { value: "Asia/Jakarta", label: "자카르타 (GMT+7)" },
  { value: "Asia/Bangkok", label: "방콕 (GMT+7)" },
];

export function LanguageRegionSettings({
  language,
  country,
  timezone,
}: {
  language: string;
  country: string;
  timezone: string;
}) {
  const router = useRouter();
  const [languageInput, setLanguageInput] = useState(language);
  const [countryInput, setCountryInput] = useState(country);
  const [timezoneInput, setTimezoneInput] = useState(timezone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = languageInput !== language || countryInput !== country || timezoneInput !== timezone;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ language: languageInput, country: countryInput, timezone: timezoneInput });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsGroup title="언어 및 지역">
      <div className="flex flex-col gap-3 p-4">
        <LabeledSelect label="언어" value={languageInput} onChange={setLanguageInput} options={LANGUAGE_OPTIONS} />
        <LabeledSelect label="국가" value={countryInput} onChange={setCountryInput} options={COUNTRY_OPTIONS} />
        <LabeledSelect label="시간대" value={timezoneInput} onChange={setTimezoneInput} options={TIMEZONE_OPTIONS} />
        {error && <p className="text-[12px] text-error">{error}</p>}
        {dirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-h-[40px] rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        )}
      </div>
    </SettingsGroup>
  );
}
