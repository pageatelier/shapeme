import { createClient } from "@/lib/supabase/server";
import { formatDateLabel } from "./date";
import { BODY_PHOTOS_BUCKET } from "./storage";
import type { BodyEntry } from "./types";

/**
 * Row shape of the `body_entries` table
 * (see supabase/migrations/0001_body_entries.sql, 0014_body_full_shot.sql).
 */
type BodyEntryRow = {
  date: string;
  front_image: string | null;
  side_image: string | null;
  back_image: string | null;
  full_body_image: string | null;
  memo: string | null;
};

const SELECT_COLUMNS = "date, front_image, side_image, back_image, full_body_image, memo";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Batch-resolves signed URLs for every photo path referenced by `rows`,
 * in one Storage call regardless of how many rows/photos there are. */
async function resolveSignedUrls(
  supabase: SupabaseServerClient,
  rows: BodyEntryRow[],
): Promise<Map<string, string>> {
  const paths = rows.flatMap((row) =>
    [row.front_image, row.side_image, row.back_image, row.full_body_image].filter((p): p is string => !!p),
  );

  const signedUrlByPath = new Map<string, string>();
  if (paths.length === 0) return signedUrlByPath;

  const { data: signed, error } = await supabase.storage
    .from(BODY_PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) signedUrlByPath.set(s.path, s.signedUrl);
  }
  return signedUrlByPath;
}

function toBodyEntry(row: BodyEntryRow, signedUrlByPath: Map<string, string>): BodyEntry {
  return {
    date: row.date,
    dateLabel: formatDateLabel(row.date),
    front: !!row.front_image,
    side: !!row.side_image,
    back: !!row.back_image,
    full: !!row.full_body_image,
    frontImageUrl: row.front_image ? signedUrlByPath.get(row.front_image) : undefined,
    sideImageUrl: row.side_image ? signedUrlByPath.get(row.side_image) : undefined,
    backImageUrl: row.back_image ? signedUrlByPath.get(row.back_image) : undefined,
    fullImageUrl: row.full_body_image ? signedUrlByPath.get(row.full_body_image) : undefined,
    memo: row.memo ?? undefined,
  };
}

/**
 * All of a user's body-check entries, newest first, with short-lived signed
 * URLs resolved for every stored photo. Only the Body list/timeline page
 * needs the *full* history — Home, the body/[date] detail page, and
 * Calendar all have narrower variants below so they aren't paying to
 * resolve signed URLs for photos they never render.
 */
export async function getBodyEntries(userId: string): Promise<BodyEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("body_entries")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  // A row survives with every slot null once all its photos are deleted
  // (deleteBodyPhoto only nulls the column, never drops the row) — filtered
  // out here so Past Shapes doesn't show an empty tile for a day with
  // nothing left.
  const rows = (data as BodyEntryRow[]).filter(
    (row) => row.front_image || row.side_image || row.back_image || row.full_body_image,
  );
  const signedUrlByPath = await resolveSignedUrls(supabase, rows);
  return rows.map((row) => toBodyEntry(row, signedUrlByPath));
}

export async function getBodyEntriesSafe(userId: string): Promise<BodyEntry[]> {
  try {
    return await getBodyEntries(userId);
  } catch (error) {
    console.error("[body] getBodyEntries failed, falling back to empty:", error);
    return [];
  }
}

/** Single day's entry (e.g. Home's "today" card, the body/[date] detail
 * page) — one row + signed URLs for just that row's own photos. */
export async function getBodyEntryByDate(userId: string, date: string): Promise<BodyEntry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("body_entries")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as BodyEntryRow;
  const signedUrlByPath = await resolveSignedUrls(supabase, [row]);
  return toBodyEntry(row, signedUrlByPath);
}

export async function getBodyEntryByDateSafe(userId: string, date: string): Promise<BodyEntry | null> {
  try {
    return await getBodyEntryByDate(userId, date);
  } catch (error) {
    console.error("[body] getBodyEntryByDate failed, falling back to null:", error);
    return null;
  }
}

/** Entries within [start, end] inclusive (e.g. Calendar's one-month view)
 * — bounded by date range instead of the user's entire history. */
export async function getBodyEntriesInRange(
  userId: string,
  start: string,
  end: string,
): Promise<BodyEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("body_entries")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  if (error) throw error;
  const rows = data as BodyEntryRow[];
  const signedUrlByPath = await resolveSignedUrls(supabase, rows);
  return rows.map((row) => toBodyEntry(row, signedUrlByPath));
}

export async function getBodyEntriesInRangeSafe(
  userId: string,
  start: string,
  end: string,
): Promise<BodyEntry[]> {
  try {
    return await getBodyEntriesInRange(userId, start, end);
  } catch (error) {
    console.error("[body] getBodyEntriesInRange failed, falling back to empty:", error);
    return [];
  }
}

/** Total Body records for My page's record count — a row only ever exists
 * once at least one photo slot has been uploaded (see upload.ts's upsert),
 * so a plain row count is already "days with a Body record". */
export async function getBodyEntryCountSafe(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("body_entries")
    .select("date", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) {
    console.error("[body] getBodyEntryCount failed:", error);
    return 0;
  }
  return count ?? 0;
}
