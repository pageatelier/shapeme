/**
 * Minimal, friend-visible slice of another user's day — returned by the
 * get_friends_today() RPC (supabase/migrations/0006_together.sql). Never
 * carries workout/meal/water/body detail, weight, height, or streaks.
 */
export type FriendCard = {
  friendId: string;
  displayName: string;
  avatarUrl: string | null;
  todayProgress: number;
  hasActivityToday: boolean;
  cheeredByMe: boolean;
  /** Only present when that friend explicitly marked today's memo public
   * (daily_notes.is_public) — null otherwise, including when they simply
   * didn't write one. */
  memo: string | null;
};
