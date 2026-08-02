import { createClient } from "@/lib/supabase/server";
import type { FriendCard } from "./types";

type FriendRow = {
  friend_id: string;
  display_name: string;
  avatar_url: string | null;
  today_progress: number;
  has_activity_today: boolean;
  cheered_by_me: boolean;
};

/** Today's cards for all of the current user's friends, via the
 * get_friends_today() SECURITY DEFINER RPC — the only place a friend's
 * detail tables are read. Relies on the caller's own session (auth.uid()),
 * not a passed-in id, so it can't be spoofed. */
export async function getFriendsToday(): Promise<FriendCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_friends_today");
  if (error) throw error;

  return ((data ?? []) as FriendRow[]).map((row) => ({
    friendId: row.friend_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    todayProgress: row.today_progress,
    hasActivityToday: row.has_activity_today,
    cheeredByMe: row.cheered_by_me,
  }));
}

export async function getFriendsTodaySafe(): Promise<FriendCard[]> {
  try {
    return await getFriendsToday();
  } catch (error) {
    console.error("[friends] getFriendsToday failed, falling back to empty:", error);
    return [];
  }
}

export async function getMyFriendCode(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("friend_code")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[friends] getMyFriendCode failed:", error);
    return null;
  }
  return data?.friend_code ?? null;
}

/** Sender ids of today's received cheers — count is just .length. Returning
 * the ids (not just a count) lets callers resolve them against an
 * already-fetched friends list to show "OOO님이 응원했어요" without a
 * second cross-user lookup. */
export async function getCheersReceivedTodaySafe(userId: string, dateIso: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cheers")
    .select("sender_id")
    .eq("receiver_id", userId)
    .eq("cheer_date", dateIso);
  if (error) {
    console.error("[friends] getCheersReceivedToday failed:", error);
    return [];
  }
  return (data ?? []).map((row) => row.sender_id as string);
}
