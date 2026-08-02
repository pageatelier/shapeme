export type BodyPhotoSlot = "front" | "side" | "back";

/**
 * UI-facing shape of a single day's 눈바디 record. Mirrors the `body_entries`
 * table (see supabase/migrations/0001_body_entries.sql) plus a couple of
 * display-only fields (dateLabel) derived from `date`. Components under
 * src/components/body/* and the future AI monthly report should depend on
 * this type rather than the mock data or the DB row shape directly, so the
 * data source can be swapped later without touching the UI.
 */
export type BodyEntry = {
  date: string; // ISO yyyy-mm-dd — maps to body_entries.date
  dateLabel: string; // e.g. "8월 2일"
  front: boolean; // derived from front_image presence
  side: boolean; // derived from side_image presence
  back: boolean; // derived from back_image presence
  frontImageUrl?: string;
  sideImageUrl?: string;
  backImageUrl?: string;
  memo?: string;
};
