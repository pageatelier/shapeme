import { createClient } from "@/lib/supabase/client";

export async function addWaterLog(amountMl: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase
    .from("water_logs")
    .insert({ user_id: user.id, amount_ml: amountMl });
  if (error) throw error;
}

/** Deletes the most recently logged water entry for the given local date, if any. */
export async function removeLastWaterLog(date: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59.999`;

  const { data, error: selectError } = await supabase
    .from("water_logs")
    .select("id")
    .eq("user_id", user.id)
    .gte("logged_at", start)
    .lte("logged_at", end)
    .order("logged_at", { ascending: false })
    .limit(1);
  if (selectError) throw selectError;

  const last = data?.[0];
  if (!last) return;

  const { error } = await supabase.from("water_logs").delete().eq("id", last.id);
  if (error) throw error;
}
