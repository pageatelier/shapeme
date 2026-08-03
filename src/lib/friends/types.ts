/** The 3 fixed cheer types a sender can pick in CheerPanel (see
 * supabase/migrations/0007_cheer_types.sql's check constraint) — kept here
 * so both the sender-side button labels and the receiver-side notification
 * text read off the same set of values instead of duplicating the list. */
export const CHEER_TYPES = ["slow", "doing_great", "together"] as const;
export type CheerType = (typeof CHEER_TYPES)[number];

/** Natural-language clause for "{name}님이 ___ 응원했어요" on the receiving
 * end — phrased to match what each CheerPanel button actually says. */
export const CHEER_RECEIVED_PHRASE: Record<CheerType, string> = {
  slow: "오늘도 천천히 하라고",
  doing_great: "잘하고 있다고",
  together: "같이 하자고",
};

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
