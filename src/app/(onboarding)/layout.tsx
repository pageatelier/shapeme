export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-shell">
      <div className="ambient-layer" />
      <div className="app-content min-h-dvh px-5 py-8">{children}</div>
    </div>
  );
}
