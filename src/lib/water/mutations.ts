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
