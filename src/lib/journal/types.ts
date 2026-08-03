export const MOOD_OPTIONS = [
  "평온해요",
  "행복해요",
  "활기차요",
  "뿌듯해요",
  "조금 지쳤어요",
  "답답해요",
  "쉬고 싶어요",
] as const;

export type Mood = (typeof MOOD_OPTIONS)[number];

/** Reuses daily_notes (see supabase/migrations/0009_journal.sql) — the
 * older memo/is_public columns on that same table are unrelated to
 * Journal and untouched by any of this. */
export type JournalEntry = {
  date: string;
  mood: Mood | null;
  dayText: string | null;
  goodThing: string | null;
  createdAt: string;
  updatedAt: string;
};
