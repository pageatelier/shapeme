export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <div className="ambient-layer" />
      {/* pb-0 (was py-10 both sides) frees up the full 40px of bottom
          padding for the bottom-anchored login/signup content to sit in —
          mt-auto on that content already pins it flush against whatever
          padding boundary exists here, so shrinking the boundary is what
          moves it lower. */}
      <div className="app-content flex min-h-dvh flex-col justify-center px-5 pt-10 pb-0">
        {children}
      </div>
    </div>
  );
}
