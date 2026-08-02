export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <div className="ambient-layer" />
      <div className="app-content flex min-h-dvh flex-col justify-center px-5 py-10">
        {children}
      </div>
    </div>
  );
}
