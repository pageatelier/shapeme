import { createClient } from "@/lib/supabase/server";

export type RoutineDayDetail = {
  routineId: string;
  title: string;
  estimatedMinutes: number | null;
  warmup: { name: string; duration_or_reps: string }[];
  cooldown: { name: string; duration_seconds: number; target_area: string }[];
  cardio: { type: string; minutes: number; intensity: string | null } | null;
};

type RoutineDayDetailRow = {
  routine_id: string;
  title: string;
  estimated_minutes: number | null;
  warmup: RoutineDayDetail["warmup"] | null;
  cooldown: RoutineDayDetail["cooldown"] | null;
  cardio: RoutineDayDetail["cardio"] | null;
};

/** AI-generated warmup/cardio/cooldown context for a set of routine ids,
 * keyed by routine_id — see supabase/migrations/0013_routine_day_details.sql.
 * Routines built by hand (or by the older onboarding mock generator) simply
 * have no row here, so callers should treat a miss as "no extra context,"
 * not an error. */
export async function getRoutineDayDetails(
  userId: string,
  routineIds: string[],
): Promise<Map<string, RoutineDayDetail>> {
  if (routineIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_day_details")
    .select("routine_id, title, estimated_minutes, warmup, cooldown, cardio")
    .eq("user_id", userId)
    .in("routine_id", routineIds);
  if (error) throw error;

  const map = new Map<string, RoutineDayDetail>();
  for (const row of (data as RoutineDayDetailRow[] | null) ?? []) {
    map.set(row.routine_id, {
      routineId: row.routine_id,
      title: row.title,
      estimatedMinutes: row.estimated_minutes,
      warmup: row.warmup ?? [],
      cooldown: row.cooldown ?? [],
      cardio: row.cardio,
    });
  }
  return map;
}

export async function getRoutineDayDetailsSafe(
  userId: string,
  routineIds: string[],
): Promise<Map<string, RoutineDayDetail>> {
  try {
    return await getRoutineDayDetails(userId, routineIds);
  } catch (error) {
    console.error("[aiRoutine] getRoutineDayDetails failed, falling back to empty:", error);
    return new Map();
  }
}

/** Whether this user has ever generated+saved an AI routine at all — gates
 * Today's "오늘의 AI 루틴 / Rest day" card so users who've never touched
 * this feature don't see an unexplained "Rest day" state. */
export async function hasAnyAiRoutineSafe(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("routine_day_details")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) throw error;
    return (count ?? 0) > 0;
  } catch (error) {
    console.error("[aiRoutine] hasAnyAiRoutine failed, falling back to false:", error);
    return false;
  }
}
