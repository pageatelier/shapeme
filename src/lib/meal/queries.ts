import { createClient } from "@/lib/supabase/server";
import { MEAL_TYPES } from "./types";
import type { Fullness, MealLog, MealType } from "./types";

type MealLogRow = {
  meal_type: MealType;
  image_path: string | null;
  description: string | null;
  fullness: string | null;
  mood: string | null;
  memo: string | null;
};

const BUCKET = "meal-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** The day's four meal slots (아침/점심/저녁/간식), filled in from real rows where logged. */
export async function getMealLogs(userId: string, date: string): Promise<MealLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_logs")
    .select("meal_type, image_path, description, fullness, mood, memo")
    .eq("user_id", userId)
    .eq("meal_date", date);
  if (error) throw error;

  const rows = (data ?? []) as MealLogRow[];
  const paths = rows.map((r) => r.image_path).filter((p): p is string => !!p);

  const signedUrlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    if (signError) throw signError;
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedUrlByPath.set(s.path, s.signedUrl);
    }
  }

  const rowByType = new Map(rows.map((r) => [r.meal_type, r]));

  return MEAL_TYPES.map((type) => {
    const row = rowByType.get(type);
    if (!row) return { type, date, filled: false };
    return {
      type,
      date,
      filled: !!row.image_path,
      imageUrl: row.image_path ? signedUrlByPath.get(row.image_path) : undefined,
      description: row.description ?? undefined,
      fullness: (row.fullness as Fullness | null) ?? undefined,
      mood: row.mood ?? undefined,
      memo: row.memo ?? undefined,
    };
  });
}

export async function getMealLogsSafe(userId: string, date: string): Promise<MealLog[]> {
  try {
    return await getMealLogs(userId, date);
  } catch (error) {
    console.error("[meal] getMealLogs failed, falling back to empty:", error);
    return MEAL_TYPES.map((type) => ({ type, date, filled: false }));
  }
}
