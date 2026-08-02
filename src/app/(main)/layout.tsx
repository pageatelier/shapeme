import { BottomNav } from "@/components/BottomNav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <div className="ambient-layer" />
      <div className="app-content safe-area-main">{children}</div>
      <BottomNav />
    </div>
  );
}
