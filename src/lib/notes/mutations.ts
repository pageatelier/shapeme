import { createClient } from "@/lib/supabase/client";

export async function saveDailyNote(date: string, memo: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase
    .from("daily_notes")
    .upsert(
      { user_id: user.id, note_date: date, memo, updated_at: new Date().toISOString() },
      { onConflict: "user_id,note_date" },
    );
  if (error) throw error;
}
