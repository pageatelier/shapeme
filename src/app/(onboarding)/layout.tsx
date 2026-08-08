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
          Continue button to the bottom instead. Doesn't use the shared
          .app-content class — that bakes in ~130px of bottom padding to
          clear the floating BottomNav pill, which doesn't exist here, so
          screens got a big empty gap below Continue. Top/bottom padding
          set explicitly instead, safe-area aware in both directions since
          there's no BottomNav or (main) layout absorbing either edge. */}
      <div
        className="relative z-10 flex min-h-dvh flex-col px-5"
        style={{
          paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </div>
    </div>
  );
}
