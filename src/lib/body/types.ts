export type BodyPhotoSlot = "front" | "side" | "back" | "full";

/** Shared labels for the 4 photo slots — used anywhere a slot name is shown
 * to the user (Capture, Compare, Timeline detail). */
export const SLOT_LABELS: Record<BodyPhotoSlot, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  full: "Full Body",
};

/**
 * UI-facing shape of a single day's body-check record. Mirrors the
 * `body_entries` table (see supabase/migrations/0001_body_entries.sql,
 * 0014_body_full_shot.sql) plus a couple of display-only fields (dateLabel)
 * derived from `date`. Components under src/components/body/* and the
 * future AI monthly report should depend on this type rather than the mock
 * data or the DB row shape directly, so the data source can be swapped
 * later without touching the UI.
 */
export type BodyEntry = {
  date: string; // ISO yyyy-mm-dd — maps to body_entries.date
  dateLabel: string; // e.g. "Aug 2"
  front: boolean; // derived from front_image presence
  side: boolean; // derived from side_image presence
  back: boolean; // derived from back_image presence
  full: boolean; // derived from full_body_image presence
  frontImageUrl?: string;
  sideImageUrl?: string;
  backImageUrl?: string;
  fullImageUrl?: string;
  memo?: string;
};

/** Front is the primary/representative slot; fall back through side, back,
 * then full so any day with at least one photo still shows something (e.g.
 * legacy entries saved before front was the required-first slot). */
export function primaryPhotoUrl(entry: BodyEntry): string | undefined {
  return entry.frontImageUrl ?? entry.sideImageUrl ?? entry.backImageUrl ?? entry.fullImageUrl;
}

/** Same precedence as primaryPhotoUrl, but returns which slot is being
 * shown — needed anywhere the primary photo can be deleted, so the delete
 * call knows which column to clear. */
export function primarySlot(entry: BodyEntry): BodyPhotoSlot | null {
  if (entry.front) return "front";
  if (entry.side) return "side";
  if (entry.back) return "back";
  if (entry.full) return "full";
  return null;
}
