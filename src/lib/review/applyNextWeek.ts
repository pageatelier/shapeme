import { saveStartingWeekToMove } from "@/lib/onboarding/saveStartingWeek";
import type { StartingWeekDay } from "@/lib/onboarding/generateStartingWeek";
import { createClient } from "@/lib/supabase/client";

const GENERATED_ROUTINE_NAMES = ["Lower Body", "Upper Body", "Full Body"];

/**
 * "다음 주 시작하기" — replaces whatever this generator previously saved
 * (matched by name, same as onboarding's saveStartingWeekToMove creates)
 * with the adjusted next week, then saves the new one. Routines the user
 * renamed or built by hand aren't touched, since matching is by exact name;
 * deleting a routine cascades to its exercises (workout_exercises.routine_id
 * on delete cascade), so no separate exercise cleanup is needed.
 */
export async function applyNextWeek(days: StartingWeekDay[]): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { data: existing, error: fetchError } = await supabase
    .from("workout_routines")
    .select("id")
    .eq("user_id", user.id)
    .in("name", GENERATED_ROUTINE_NAMES);
  if (fetchError) throw fetchError;

  if (existing && existing.length > 0) {
    const { error: deleteError } = await supabase
      .from("workout_routines")
      .delete()
      .in(
        "id",
        existing.map((r: { id: string }) => r.id),
      );
    if (deleteError) throw deleteError;
  }

  await saveStartingWeekToMove(days);
}
