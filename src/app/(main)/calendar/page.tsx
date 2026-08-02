import Link from "next/link";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { todayIsoDate } from "@/lib/body/date";
import { getActiveChallengeSafe } from "@/lib/challenge/queries";
import { getCalendarMonthSafe } from "@/lib/calendar/queries";
import { createClient } from "@/lib/supabase/server";

function monthLink(year: number, month: number, offset: number) {
  const date = new Date(year, month - 1 + offset, 1);
  return `/calendar?year=${date.getFullYear()}&month=${date.getMonth() + 1}`;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const params = await searchParams;
  const [currentYear, currentMonth] = todayIsoDate().split("-").map(Number);
  const year = Number(params.year) || currentYear;
  const month = Number(params.month) || currentMonth;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const challenge = user ? await getActiveChallengeSafe(user.id) : null;
  const { days, report } = user ? await getCalendarMonthSafe(user.id, challenge, year, month) : { days: [], report: { workoutDays: 0, recoveryDays: 0, bodyPhotoDays: 0, completedSets: 0 } };
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link href={monthLink(year, month, -1)} className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary" style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}>‹</Link>
        <div className="text-center">
          <p className="text-lg font-bold tracking-[-0.02em] text-text-primary">{year}년 {month}월</p>
          <p className="font-en text-[11px] text-text-muted">100 days journey</p>
        </div>
        <Link href={monthLink(year, month, 1)} className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary" style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}>›</Link>
      </div>

      <CalendarGrid days={days} firstWeekday={firstWeekday} />

      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">이번 달 기록</p>
        <div className="grid grid-cols-2 gap-3">
          <ReportCard label="운동 완료" value={`${report.workoutDays}일`} />
          <ReportCard label="회복일" value={`${report.recoveryDays}일`} />
          <ReportCard label="완료한 세트" value={`${report.completedSets}세트`} />
          <ReportCard label="눈바디 촬영" value={`${report.bodyPhotoDays}회`} />
        </div>
      </section>
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return <div className="surface-card p-4"><p className="font-en mb-1 text-lg font-semibold tracking-[-0.03em] text-text-primary">{value}</p><p className="text-[11px] text-text-muted">{label}</p></div>;
}
