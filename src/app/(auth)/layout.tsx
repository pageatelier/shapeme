export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <div className="ambient-layer" />
      {/* paddingBottom forced to 0 via inline style, not the pb-0 utility —
          .app-content's own padding-bottom: 130px (for BottomNav clearance,
          see that class in globals.css) is plain unlayered CSS, which beats
          any @layer utilities class like pb-0 regardless of source order in
          Tailwind v4. Without this, the 130px leaked through, making the
          page ~130px taller than the viewport and scrollable — exactly the
          BottomNav gap this page doesn't have. mt-auto on the bottom-
          anchored content below already pins it against whatever boundary
          exists here, so shrinking the boundary is what moves it lower. */}
      <div
        className="app-content flex min-h-dvh flex-col justify-center px-5 pt-10"
        style={{ paddingBottom: 0 }}
      >
        {children}
      </div>
    </div>
  );
}
