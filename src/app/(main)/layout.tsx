import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { DateRolloverWatcher } from "@/components/DateRolloverWatcher";
import { readOnboardingProfile } from "@/lib/onboarding/types";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  // Applies to every account, not just new signups — accounts created
  // before onboarding existed have onboardingCompleted unset too, so they
  // get routed through it here rather than being grandfathered in.
  if (user && !readOnboardingProfile(user.user_metadata).onboardingCompleted) {
    redirect("/onboarding");
  }
  const settings = readSettings(user?.user_metadata);

  return (
    <div className="app-shell" data-theme={settings.darkModeEnabled ? "dark" : "light"}>
      <DateRolloverWatcher />
      <div className="ambient-layer" />
      {/* padding-top set inline (not via the shared .app-content class,
          which the auth layout also uses with its own py-10) — Tailwind
          utilities live in a lower-priority @layer, so adding this to
          globals.css would silently win over that py-10 there too. */}
      <div className="app-content px-5" style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))" }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
