import { createClient } from "@/lib/supabase/server";
import { formatDateLabel } from "./date";
import { BODY_PHOTOS_BUCKET } from "./storage";
import type { BodyEntry } from "./types";

/**
 * Row shape of the `body_entries` table
 * (see supabase/migrations/0001_body_entries.sql).
 */
type BodyEntryRow = {
  date: string;
  front_image: string | null;
  side_image: string | null;
  back_image: string | null;
  memo: string | null;
};

const SIGNED_URL_TTL_SECONDS = 60 * 60;

function toBodyEntry(row: BodyEntryRow, signedUrlByPath: Map<string, string>): BodyEntry {
  return {
    date: row.date,
    dateLabel: formatDateLabel(row.date),
    front: !!row.front_image,
    side: !!row.side_image,
    back: !!row.back_image,
    frontImageUrl: row.front_image ? signedUrlByPath.get(row.front_image) : undefined,
    sideImageUrl: row.side_image ? signedUrlByPath.get(row.side_image) : undefined,
    backImageUrl: row.back_image ? signedUrlByPath.get(row.back_image) : undefined,
    memo: row.memo ?? undefined,
  };
}

/**
 * All of a user's 눈바디 entries, newest first, with short-lived signed URLs
 * resolved for every stored photo (the `body-photos` bucket is private, so
 * the raw storage path in the DB row is never directly usable as an <img
 * src>). TodayBodyCard / BodyCapture / BodyCompare / BodyTimeline — and
 * later the AI monthly report — all just consume the returned `BodyEntry[]`,
 * so callers can filter it down (e.g. to "today") without a second query.
 */
export async function getBodyEntries(userId: string): Promise<BodyEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("body_entries")
    .select("date, front_image, side_image, back_image, memo")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  const rows = data as BodyEntryRow[];

  const paths = rows.flatMap((row) =>
    [row.front_image, row.side_image, row.back_image].filter((p): p is string => !!p),
  );

  const signedUrlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed, error: signError } = await supabase.storage
      .from(BODY_PHOTOS_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    if (signError) throw signError;
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedUrlByPath.set(s.path, s.signedUrl);
    }
  }

  return rows.map((row) => toBodyEntry(row, signedUrlByPath));
}

/**
 * Same as getBodyEntries, but resolves to [] instead of throwing — used on
 * pages that must still render (Home, Body) if the body_entries migration
 * (supabase/migrations/0001_body_entries.sql) hasn't been applied to the
 * project yet.
 */
export async function getBodyEntriesSafe(userId: string): Promise<BodyEntry[]> {
  try {
    return await getBodyEntries(userId);
  } catch (error) {
    console.error("[body] getBodyEntries failed, falling back to empty:", error);
    return [];
  }
}
