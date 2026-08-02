import { createClient } from "@/lib/supabase/server";

export type DailyNote = { memo: string | null; isPublic: boolean };

const EMPTY_NOTE: DailyNote = { memo: null, isPublic: false };

/** Today's (or any single day's) memo, or an empty/private default if
 * nothing saved yet. */
export async function getDailyNote(userId: string, date: string): Promise<DailyNote> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_notes")
    .select("memo, is_public")
    .eq("user_id", userId)
    .eq("note_date", date)
    .maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY_NOTE;
  const row = data as { memo: string | null; is_public: boolean };
  return { memo: row.memo, isPublic: row.is_public };
}

export async function getDailyNoteSafe(userId: string, date: string): Promise<DailyNote> {
  try {
    return await getDailyNote(userId, date);
  } catch (error) {
    console.error("[notes] getDailyNote failed, falling back to empty:", error);
    return EMPTY_NOTE;
  }
}

/** Map of note_date -> memo for every note in [start, end], for Calendar. */
export async function getDailyNotesForRange(
  userId: string,
  start: string,
  end: string,
): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_notes")
    .select("note_date, memo")
    .eq("user_id", userId)
    .gte("note_date", start)
    .lte("note_date", end);
  if (error) throw error;

  const map = new Map<string, string>();
  for (const row of (data ?? []) as { note_date: string; memo: string | null }[]) {
    if (row.memo) map.set(row.note_date, row.memo);
  }
  return map;
}
