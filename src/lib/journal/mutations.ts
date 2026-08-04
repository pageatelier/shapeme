import { createClient } from "@/lib/supabase/client";
import type { Mood } from "./types";

export async function saveJournalEntry(
  date: string,
  entry: { mood: Mood | null; dayText: string; goodThing: string },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase.from("daily_notes").upsert(
    {
      user_id: user.id,
      note_date: date,
      mood: entry.mood,
      day_text: entry.dayText.trim() || null,
      good_thing: entry.goodThing.trim() || null,
      updated_at: new Date().toISOString(),
      // created_at intentionally omitted from the payload — the column's
      // default only fires on the insert path, so an existing row's real
      // creation time is never clobbered by a later edit.
    },
    { onConflict: "user_id,note_date" },
  );
  if (error) throw error;
}
