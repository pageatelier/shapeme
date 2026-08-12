"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LANGUAGE_OPTIONS } from "@/lib/locale/region";
import { updateProfile } from "@/lib/profile/mutations";
import { LabeledSelect, SettingsGroup } from "./SettingsPrimitives";

const TIMEZONE_OPTIONS = [
  { value: "Asia/Seoul", label: "Seoul (GMT+9)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (GMT+8)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Jakarta", label: "Jakarta (GMT+7)" },
  { value: "Asia/Bangkok", label: "Bangkok (GMT+7)" },
];

/** Country was dropped from this screen (Silua's UI is English-first
 * globally now, not region-gated) — language/timezone stay editable, with
 * the same select UI kept as-is so more languages/timezones can be added
 * later without a redesign. */
export function LanguageRegionSettings({ language, timezone }: { language: string; timezone: string }) {
  const router = useRouter();
  const [languageInput, setLanguageInput] = useState(language);
  const [timezoneInput, setTimezoneInput] = useState(timezone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = languageInput !== language || timezoneInput !== timezone;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ language: languageInput, timezone: timezoneInput });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsGroup title="Language & Time">
      <div className="flex flex-col gap-3 p-4">
        <LabeledSelect label="Language" value={languageInput} onChange={setLanguageInput} options={LANGUAGE_OPTIONS} />
        <LabeledSelect label="Time zone" value={timezoneInput} onChange={setTimezoneInput} options={TIMEZONE_OPTIONS} />
        {error && <p className="text-[12px] text-error">{error}</p>}
        {dirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-h-[40px] rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </SettingsGroup>
  );
}
