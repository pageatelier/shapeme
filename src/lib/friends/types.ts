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
};
