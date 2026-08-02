export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-[#faf7f3]">
      <div className="flex -translate-y-4 flex-col items-center">
        <p className="brand-logo text-[48px] font-semibold tracking-[-0.035em] text-[#563e3a]">
          ShapeMe
        </p>

        <div className="mt-5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#e5a0a8]" />
      </div>
    </div>
  );
}