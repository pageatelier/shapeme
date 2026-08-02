import { BottomNav } from "@/components/BottomNav";
import { DateRolloverWatcher } from "@/components/DateRolloverWatcher";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <DateRolloverWatcher />
      <div className="ambient-layer" />
      <div className="app-content px-5 pt-6 pb-28">{children}</div>
      <BottomNav />
    </div>
  );
}
