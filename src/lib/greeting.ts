export const dailyMessages: string[] = [
  "Another day, another chance to care for yourself. 🌷",
  "Be gentle with yourself today. 🤍",
  "Slow down and make today yours. 🌿",
  "You're doing just fine. 🫶",
  "Small steps shape who you are today. ✨",
  "Start with the smallest act of self-love. 💗",
  "You're beautiful exactly as you are today. 🪞",
  "It's okay if today isn't perfect. ☁️",
  "Listen to what your body's telling you. 🧘🏻‍♀️",
  "Stay true to you — gently. 🎀",
  "A little movement today changes everything. 🏃🏻‍♀️",
  "Starting light is still starting. 🌱",
  "Let's check off today's routine, one step at a time. ☑️",
  "A little more care than yesterday. 🌷",
  "Make time for your body and mind. 🧘🏻‍♀️",
  "Ease into today's goal — no pressure. 🎯",
  "One small check builds real change. ✔️",
  "Keep the promise you made to yourself. 🤝",
  "Consistency is the most beautiful kind of change. 🌿",
  "Take one step for today's you. 👟",
  "Every moment shapes me. ✨",
  "Today's moments are shaping who you are. 🌙",
  "You're blooming a little more each day. 🌸",
  "You're growing at your own pace, today too. 🌱",
  "Time spent on yourself is adding up. 🫧",
  "What you record today shapes tomorrow's change. 📖",
  "It's okay to bloom slowly. 🌷",
  "Tend to yourself beautifully today. 🎀",
  "The moment you care for yourself, change begins. ✨",
  "Capture today's you, gently. 📸",
];

/** Time-of-day salutation for the Today page's greeting line. */
export function getGreetingPrefix(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const CYCLE_LENGTH = dailyMessages.length;
const EPOCH_UTC_MS = Date.UTC(2024, 0, 1);

/** Days between `iso` (YYYY-MM-DD) and a fixed epoch, computed via UTC date
 * math only — no ambient-timezone `new Date(str)` parsing, so it's stable
 * regardless of the server/runtime's local timezone. */
function daysSinceEpoch(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const utcMs = Date.UTC(year, month - 1, day);
  return Math.floor((utcMs - EPOCH_UTC_MS) / 86_400_000);
}

/** Deterministic seeded PRNG (mulberry32) — same seed always produces the
 * same sequence, so the shuffle is stable across requests/server restarts. */
function mulberry32(seed: number) {
  let state = seed;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TRAILING_EMOJI_RE =
  /\p{Extended_Pictographic}(?:️)?(?:[\u{1F3FB}-\u{1F3FF}])?(?:‍\p{Extended_Pictographic}(?:️)?)*\s*$/u;

function trailingEmoji(message: string): string {
  const match = message.match(TRAILING_EMOJI_RE);
  return match ? match[0].trim() : "";
}

/** One full shuffle of all 30 message indices for the given cycle number,
 * with a best-effort pass to avoid two consecutive entries sharing the same
 * trailing emoji. */
function shuffledCycle(cycleIndex: number): number[] {
  const order = Array.from({ length: CYCLE_LENGTH }, (_, i) => i);
  const random = mulberry32(cycleIndex + 1);

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const emojiOf = order.map((idx) => trailingEmoji(dailyMessages[idx]));
  for (let i = 1; i < order.length; i++) {
    if (emojiOf[i] !== emojiOf[i - 1]) continue;
    const swapWith = order.findIndex(
      (_, j) => j > i && emojiOf[j] !== emojiOf[i] && emojiOf[j] !== emojiOf[i - 1],
    );
    if (swapWith === -1) continue;
    [order[i], order[swapWith]] = [order[swapWith], order[i]];
    [emojiOf[i], emojiOf[swapWith]] = [emojiOf[swapWith], emojiOf[i]];
  }

  return order;
}

/**
 * Message-of-the-day for `dateIso` (YYYY-MM-DD) — pure function of the date,
 * so server render and client hydration always agree (no client-only Date()
 * or Math.random() involved). Cycles through all 30 messages once (in a
 * date-seeded shuffle) before repeating.
 */
export function getDailyMessage(dateIso: string): string {
  const dayIndex = daysSinceEpoch(dateIso);
  const cycleIndex = Math.floor(dayIndex / CYCLE_LENGTH);
  const positionInCycle = ((dayIndex % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  const order = shuffledCycle(cycleIndex);
  return dailyMessages[order[positionInCycle]];
}
