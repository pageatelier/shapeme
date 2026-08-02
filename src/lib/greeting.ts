export const dailyMessages: string[] = [
  "오늘도 나를 돌보는 하루를 시작해요. 🌷",
  "오늘의 나에게 다정해져 볼까요? 🤍",
  "천천히, 나를 위한 하루를 만들어봐요. 🌿",
  "오늘도 충분히 잘하고 있어요. 🫶",
  "작은 실천이 오늘의 나를 만들어요. ✨",
  "나를 사랑하는 가장 작은 방법부터 시작해요. 💗",
  "오늘의 나도 있는 그대로 아름다워요. 🪞",
  "완벽하지 않아도 괜찮은 하루예요. ☁️",
  "내 몸의 목소리에 귀 기울여봐요. 🧘🏻‍♀️",
  "오늘도 나답게, 부드럽게. 🎀",
  "오늘의 작은 움직임이 나를 바꿔요. 🏃🏻‍♀️",
  "가볍게 시작해도 충분해요. 🌱",
  "오늘의 루틴을 하나씩 채워볼까요? ☑️",
  "어제보다 조금 더 나를 돌봐요. 🌷",
  "몸과 마음을 위한 시간을 시작해요. 🧘🏻‍♀️",
  "오늘의 목표, 부담 없이 시작해봐요. 🎯",
  "작은 체크 하나가 큰 변화를 만들어요. ✔️",
  "오늘도 나와의 약속을 지켜봐요. 🤝",
  "꾸준함은 가장 아름다운 변화예요. 🌿",
  "오늘의 나를 위한 한 걸음을 시작해요. 👟",
  "Every moment shapes me. ✨",
  "오늘의 순간들이 나를 만들어가요. 🌙",
  "나는 매일 조금씩 피어나고 있어요. 🌸",
  "오늘도 나만의 속도로 성장하고 있어요. 🌱",
  "나를 위한 시간이 차곡차곡 쌓이고 있어요. 🫧",
  "오늘의 기록이 내일의 변화를 만들어요. 📖",
  "천천히 피어나도 괜찮아요. 🌷",
  "오늘도 나를 아름답게 가꿔봐요. 🎀",
  "나를 돌보는 순간, 변화는 시작돼요. ✨",
  "오늘의 나를 소중히 기록해요. 📸",
];

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
