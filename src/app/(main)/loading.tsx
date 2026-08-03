export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="h-9 w-28 rounded-full" style={{ background: "var(--surface-card)" }} />
      <div className="h-24 rounded-[var(--radius-lg)]" style={{ background: "var(--surface-card)" }} />
      <div className="h-40 rounded-[var(--radius-lg)]" style={{ background: "var(--surface-card)" }} />
      <div className="h-24 rounded-[var(--radius-lg)]" style={{ background: "var(--surface-card)" }} />
    </div>
  );
}
