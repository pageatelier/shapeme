export function CheersReceivedCard({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <div className="glass-card flex items-center justify-between p-4">
      <p className="text-[13px] font-medium text-text-primary">오늘 친구들의 응원을 받았어요 🌷</p>
      <span className="font-en text-[13px] font-bold text-text-secondary">응원 {count}개</span>
    </div>
  );
}
