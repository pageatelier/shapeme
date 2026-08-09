"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { LabeledSelect } from "@/components/my/SettingsPrimitives";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/locale/region";
import type { CountryCode, LanguageCode } from "@/lib/locale/region";

export function LanguageRegionStep({
  language,
  country,
  onChange,
}: {
  language: LanguageCode;
  country: CountryCode;
  onChange: (patch: { language?: LanguageCode; country?: CountryCode }) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <BrandLogo className="mb-3" />
        <p className="text-[15px] text-text-secondary">Welcome to ShapeMe</p>
      </div>
      <div className="glass-card flex flex-col gap-4 p-6">
        <LabeledSelect
          label="Language"
          value={language}
          onChange={(v) => onChange({ language: v as LanguageCode })}
          options={LANGUAGE_OPTIONS}
        />
        <LabeledSelect
          label="Region"
          value={country}
          onChange={(v) => onChange({ country: v as CountryCode })}
          options={COUNTRY_OPTIONS}
        />
      </div>
    </div>
  );
}
