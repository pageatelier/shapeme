import { BottomNav } from "@/components/BottomNav";
import { DateRolloverWatcher } from "@/components/DateRolloverWatcher";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const settings = readSettings(user?.user_metadata);

  return (
    <div className="app-shell" data-theme={settings.darkModeEnabled ? "dark" : "light"}>
      <DateRolloverWatcher />
      <div className="ambient-layer" />
      <div className="app-content px-5 pt-6">{children}</div>
      <BottomNav />
    </div>
  );
}
