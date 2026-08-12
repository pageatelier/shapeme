"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/server";

/**
 * Permanently deletes the current user's data AND their auth account/login
 * itself — unlike DeleteAccountSection's "delete account data" (which wipes
 * data/storage but deliberately keeps the login usable), this is meant to
 * be unrecoverable end to end. auth.admin.deleteUser() requires the
 * service_role key, which can only ever run server-side (never expose it to
 * the browser) — that's why this is a Server Action rather than a client
 * Supabase call like DeleteAccountSection uses. Storage files are removed
 * explicitly first since deleting the auth user doesn't clean up Storage
 * objects on its own; table rows are deleted explicitly too rather than
 * relying on FK cascades that may or may not be configured.
 */
export async function deleteAccountPermanently() {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요해요.");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않아요. 관리자에게 문의하세요.");
  }

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [bodyRes, mealRes] = await Promise.all([
    admin.from("body_entries").select("front_image, side_image, back_image").eq("user_id", user.id),
    admin.from("meal_logs").select("image_path").eq("user_id", user.id),
  ]);

  const bodyPaths = (bodyRes.data ?? [])
    .flatMap((r) => [r.front_image, r.side_image, r.back_image])
    .filter((p): p is string => Boolean(p));
  const mealPaths = (mealRes.data ?? [])
    .map((r) => r.image_path as string | null)
    .filter((p): p is string => Boolean(p));

  if (bodyPaths.length > 0) await admin.storage.from("body-photos").remove(bodyPaths);
  if (mealPaths.length > 0) await admin.storage.from("meal-photos").remove(mealPaths);

  const { data: avatarFiles } = await admin.storage.from("avatars").list(user.id);
  if (avatarFiles && avatarFiles.length > 0) {
    await admin.storage.from("avatars").remove(avatarFiles.map((f) => `${user.id}/${f.name}`));
  }

  await Promise.all([
    admin.from("workout_routines").delete().eq("user_id", user.id),
    admin.from("body_entries").delete().eq("user_id", user.id),
    admin.from("water_logs").delete().eq("user_id", user.id),
    admin.from("meal_logs").delete().eq("user_id", user.id),
    admin.from("daily_notes").delete().eq("user_id", user.id),
  ]);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);
}
