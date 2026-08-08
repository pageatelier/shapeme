export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <div className="ambient-layer" />
      {/* No BottomNav here — onboarding is its own linear flow, not a main
          tab (mirrors (auth)/layout.tsx's minimal shell). Unlike the auth
          layout this isn't vertically centered: step content pins its
          Continue button to the bottom instead. */}
      <div className="app-content flex min-h-dvh flex-col px-5 py-6">{children}</div>
    </div>
  );
}
