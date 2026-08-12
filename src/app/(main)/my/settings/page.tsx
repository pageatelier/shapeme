import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { ChangePasswordSection } from "@/components/my/ChangePasswordSection";
import { DeleteAccountSection } from "@/components/my/DeleteAccountSection";
import { LanguageRegionSettings } from "@/components/my/LanguageRegionSettings";
import { LogoutButton } from "@/components/my/LogoutButton";
import { MealWaterSettings } from "@/components/my/MealWaterSettings";
import { NotificationSettings } from "@/components/my/NotificationSettings";
import { PermanentDeleteAccountSection } from "@/components/my/PermanentDeleteAccountSection";
import { SessionManagementSection } from "@/components/my/SessionManagementSection";
import { SettingsGroup, StaticRow } from "@/components/my/SettingsPrimitives";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MySettingsPage() {
  const user = await getCurrentUser();

  const metadata = (user?.user_metadata ?? {}) as {
    language?: string;
    timezone?: string;
  };
  const language = metadata.language || "ko";
  const timezone = metadata.timezone || "Asia/Seoul";
  const settings = readSettings(user?.user_metadata);

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
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Settings</h1>
      </div>

      <SettingsGroup title="Preferences">
        <MealWaterSettings settings={settings} />
      </SettingsGroup>

      <LanguageRegionSettings language={language} timezone={timezone} />

      <SettingsGroup title="Notifications">
        <NotificationSettings settings={settings} />
      </SettingsGroup>

      <SettingsGroup title="Privacy & Security">
        <div>
          <StaticRow label="Body photo privacy" value="Private by default" />
          <p className="px-4 pb-3 text-[11px] text-text-secondary">
            Your body photos are private and only visible to you.
          </p>
        </div>
        <ChangePasswordSection />
        <SessionManagementSection />
      </SettingsGroup>

      {/* "Reset your Silua data" lives here as a plain row next to Log out —
          same Account card, no red tint until it's actually expanded (see
          DeleteAccountSection). "Delete account" stays separate, further
          below, as the page's one standalone danger action — keeping
          Settings' first view free of a standing warning box fits SILUA's
          quieter, editorial tone better than a SaaS-style danger zone. */}
      <SettingsGroup title="Account">
        <div className="flex justify-center p-4">
          <LogoutButton />
        </div>
        <DeleteAccountSection />
      </SettingsGroup>

      <PermanentDeleteAccountSection />
    </div>
  );
}
