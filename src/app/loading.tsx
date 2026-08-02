export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center"
      style={{ backgroundColor: "#faf7f3" }}
    >
      <div className="-translate-y-4 text-center">
        <div
          className="text-[52px] font-semibold leading-none tracking-[-0.035em] text-[#563e3a]"
          style={{
            fontFamily: "var(--font-logo-loaded), serif",
          }}
        >
          ShapeMe
        </div>

        <div className="mt-6 flex justify-center">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e7a0a7]" />
        </div>
      </div>
    </div>
  );
}