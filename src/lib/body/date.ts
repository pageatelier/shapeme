/** Today's date as YYYY-MM-DD, used as the body_entries.date key. */
export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}
