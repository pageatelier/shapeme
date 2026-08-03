import Link from "next/link";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { getCalendarMonthSafe } from "@/lib/calendar/queries";
import { readSettings } from "@/lib/settings/types";
import { getCurrentUser } from "@/lib/supabase/server";

function monthLink(year: number, month: number, offset: number) {
  const d = new Date(year, month - 1 + offset, 1);
  return `/calendar?year=${d.getFullYear()}&month=${d.getMonth() + 1}`;
}

export default async function CalendarPage(props: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await props.searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;

  const user = await getCurrentUser();

  const { days, report } = user
    ? await getCalendarMonthSafe(user.id, year, month)
    : { days: [], report: { avgCompletion: 0, workoutDays: 0, waterGoalDays: 0, mealLogDays: 0, bodyPhotoDays: 0, bestStreakDay: null } };

  const settings = readSettings(user?.user_metadata);
  const firstWeekdaySun = new Date(year, month - 1, 1).getDay();
  const firstWeekday = settings.weekStartDay === "mon" ? (firstWeekdaySun + 6) % 7 : firstWeekdaySun;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href={monthLink(year, month, -1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          ‹
        </Link>
        <div className="text-center">
          <p className="text-lg font-bold tracking-[-0.02em] text-text-primary">
            {year}년 {month}월
          </p>
          <p className="font-en text-[11px] text-text-muted">월평균 {report.avgCompletion}%</p>
        </div>
        <Link
          href={monthLink(year, month, 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          ›
        </Link>
      </div>

      <CalendarGrid days={days} firstWeekday={firstWeekday} weekStartDay={settings.weekStartDay} />

      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">이번 달 리포트</p>
        <div className="grid grid-cols-2 gap-3">
          <ReportCard label="운동한 날짜" value={`${report.workoutDays}일`} />
          <ReportCard label="물 목표 달성" value={`${report.waterGoalDays}일`} />
          <ReportCard label="식단 기록" value={`${report.mealLogDays}일`} />
          <ReportCard label="몸 사진 기록" value={`${report.bodyPhotoDays}회`} />
        </div>
        {report.bestStreakDay && (
          <p className="mt-3 text-xs text-text-muted">
            가장 꾸준했던 요일은 <span className="font-semibold text-text-secondary">{report.bestStreakDay}</span>예요.
          </p>
        )}
      </section>
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="font-en mb-1 text-lg font-semibold tracking-[-0.03em] text-text-primary">{value}</p>
      <p className="text-[11px] text-text-muted">{label}</p>
    </div>
  );
}
