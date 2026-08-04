import { createClient } from "@/lib/supabase/server";
import type { JournalEntry, Mood } from "./types";

type Row = {
  note_date: string;
  mood: string | null;
  day_text: string | null;
  good_thing: string | null;
  created_at: string;
  updated_at: string;
};

const JOURNAL_COLUMNS = "note_date, mood, day_text, good_thing, created_at, updated_at";

function toEntry(row: Row): JournalEntry {
  return {
    date: row.note_date,
    mood: row.mood as Mood | null,
    dayText: row.day_text,
    goodThing: row.good_thing,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** A day's Journal entry, or null if that day has no journal content yet
 * (including when the row exists only for the older private-memo field). */
export async function getJournalEntryByDate(userId: string, date: string): Promise<JournalEntry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_notes")
    .select(JOURNAL_COLUMNS)
    .eq("user_id", userId)
    .eq("note_date", date)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as Row;
  if (!row.mood && !row.day_text && !row.good_thing) return null;
  return toEntry(row);
}

export async function getJournalEntryByDateSafe(userId: string, date: string): Promise<JournalEntry | null> {
  try {
    return await getJournalEntryByDate(userId, date);
  } catch (error) {
    console.error("[journal] getJournalEntryByDate failed, falling back to null:", error);
    return null;
  }
}
