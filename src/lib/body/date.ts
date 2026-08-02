/**
 * Return a calendar date as YYYY-MM-DD in the app's default timezone.
 *
 * ShapeMe currently targets Korean users, while Vercel/Supabase servers often
 * run in UTC. Using `toISOString()` around midnight could therefore attach a
 * workout or photo to the wrong day. Keep all date keys aligned to Asia/Seoul.
 */
export function isoDateInTimeZone(
  date = new Date(),
  timeZone = "Asia/Seoul",
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

/** Today's date as YYYY-MM-DD, used by all daily record tables. */
export function todayIsoDate(): string {
  return isoDateInTimeZone();
}

export function formatDateLabel(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

/**
 * Day of week for a YYYY-MM-DD date string: 0 = Sunday ... 6 = Saturday.
 * Calendar dates have no timezone of their own, so this parses the Y/M/D
 * components straight into `Date.UTC` and reads them back with the UTC
 * getter — never touching the runtime's local timezone. Prefer this over
 * `new Date(iso + "T00:00:00").getDay()`, which silently depends on
 * whatever timezone the process happens to run in.
 */
export function weekdayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
