import { createClient } from "@/lib/supabase/client";
import type { MovementActivityType } from "./types";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");
  return { supabase, userId: user.id };
}

export type MovementLogInput = {
  date: string;
  activityType: MovementActivityType;
  durationMinutes: number;
  distanceKm?: number | null;
  steps?: number | null;
  calories?: number | null;
  memo?: string | null;
};

export async function saveMovementLog(input: MovementLogInput): Promise<void> {
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase.from("movement_logs").insert({
    user_id: userId,
    log_date: input.date,
    activity_type: input.activityType,
    duration_minutes: input.durationMinutes,
    distance_km: input.distanceKm ?? null,
    steps: input.steps ?? null,
    calories: input.calories ?? null,
    memo: input.memo ?? null,
  });
  if (error) throw error;
}

export async function updateMovementLog(id: string, input: MovementLogInput): Promise<void> {
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("movement_logs")
    .update({
      log_date: input.date,
      activity_type: input.activityType,
      duration_minutes: input.durationMinutes,
      distance_km: input.distanceKm ?? null,
      steps: input.steps ?? null,
      calories: input.calories ?? null,
      memo: input.memo ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMovementLog(id: string): Promise<void> {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("movement_logs").delete().eq("id", id);
  if (error) throw error;
}
