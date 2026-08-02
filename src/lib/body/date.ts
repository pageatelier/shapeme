/** iso date (YYYY-MM-DD) of `date` as seen in `timeZone`, default Asia/Seoul. */
export function isoDateInTimeZone(date = new Date(), timeZone = "Asia/Seoul"): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

/** Today's date as YYYY-MM-DD in KST, used as the body_entries.date key. */
export function todayIsoDate(): string {
  return isoDateInTimeZone();
}

/** Timezone-independent day-of-week (0=Sun..6=Sat) for a YYYY-MM-DD date key. */
export function weekdayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function formatDateLabel(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}
