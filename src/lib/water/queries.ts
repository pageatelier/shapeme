import { createClient } from "@/lib/supabase/server";
import type { WaterDay, WaterLog } from "./types";

type WaterLogRow = {
  id: string;
  amount_ml: number;
  logged_at: string;
};

function toTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** All water logs for the given local date (YYYY-MM-DD), oldest first. */
export async function getWaterLogs(userId: string, date: string): Promise<WaterDay> {
  const supabase = await createClient();
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59.999`;

  const { data, error } = await supabase
    .from("water_logs")
    .select("id, amount_ml, logged_at")
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lte("logged_at", end)
    .order("logged_at", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as WaterLogRow[];
  const entries: WaterLog[] = rows.map((r) => ({
    id: r.id,
    amountMl: r.amount_ml,
    time: toTime(r.logged_at),
    loggedAt: r.logged_at,
  }));

  return {
    entries,
    totalMl: entries.reduce((sum, e) => sum + e.amountMl, 0),
  };
}

export async function getWaterLogsSafe(userId: string, date: string): Promise<WaterDay> {
  try {
    return await getWaterLogs(userId, date);
  } catch (error) {
    console.error("[water] getWaterLogs failed, falling back to empty:", error);
    return { entries: [], totalMl: 0 };
  }
}
