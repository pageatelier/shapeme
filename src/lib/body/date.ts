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
