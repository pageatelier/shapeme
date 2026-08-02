import { todayIsoDate } from "@/lib/body/date";
import { createClient } from "@/lib/supabase/client";

const CODE_ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "존재하지 않는 코드예요.",
  cannot_add_self: "내 코드는 추가할 수 없어요.",
  already_friends: "이미 친구예요.",
  not_authenticated: "로그인이 필요해요.",
};

function friendlyRpcError(error: { message: string; code?: string; details?: string | null; hint?: string | null }): string {
  const key = Object.keys(CODE_ERROR_MESSAGES).find((k) => error.message.includes(k));
  if (key) return CODE_ERROR_MESSAGES[key];
  // Unrecognized error — surface the real message instead of a generic one
  // so it's actually debuggable (this RPC hasn't been exercised against a
  // live database yet).
  return `친구 추가에 실패했어요. (${error.message})`;
}

export async function addFriendByCode(code: string): Promise<{ displayName: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("add_friend_by_code", { p_code: code.trim() });
  if (error) {
    console.error("[friends] add_friend_by_code failed:", error);
    throw new Error(friendlyRpcError(error));
  }

  const row = Array.isArray(data) ? data[0] : data;
  const displayName = (row?.friend_display_name as string | undefined) || "친구";
  return { displayName };
}

/** Removes both directional rows so the friendship is fully undone from
 * either side (the delete RLS policy allows matching on user_id OR
 * friend_id — see supabase/migrations/0006_together.sql). */
export async function removeFriend(friendId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const [a, b] = await Promise.all([
    supabase.from("friendships").delete().eq("user_id", user.id).eq("friend_id", friendId),
    supabase.from("friendships").delete().eq("user_id", friendId).eq("friend_id", user.id),
  ]);
  if (a.error) throw a.error;
  if (b.error) throw b.error;
}

export async function sendCheer(receiverId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase.from("cheers").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    cheer_date: todayIsoDate(),
  });
  if (error && error.code !== "23505") {
    // 23505 = unique_violation — already cheered today; treat as success.
    throw error;
  }
}
