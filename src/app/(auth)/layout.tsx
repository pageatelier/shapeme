export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <div className="ambient-layer" />
      <div className="app-content safe-area-auth flex min-h-dvh flex-col justify-center">
        {children}
      </div>
    </div>
  );
}
