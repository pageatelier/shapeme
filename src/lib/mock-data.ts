import type { BodyEntry } from "@/lib/body/types";

export type SetLog = boolean[];

export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  targetSets: number;
  targetReps: number;
  weightKg: number | null;
  restSeconds: number;
  sets: SetLog;
  memo?: string;
};

export type Routine = {
  id: string;
  name: string;
  days: string[];
  active: boolean;
};

export type MealType = "morning" | "lunch" | "dinner" | "snack";

export type MealEntry = {
  type: MealType;
  label: string;
  filled: boolean;
  time?: string;
  description?: string;
  fullness?: "부족함" | "적당함" | "배부름" | "과식함";
  mood?: string;
};

export type WaterEntry = {
  time: string;
  amountMl: number;
};

export type CalendarDay = {
  date: number;
  isoDate: string;
  completionRate: number | null;
  isToday?: boolean;
  isRestDay?: boolean;
  workoutDone?: boolean;
  waterDone?: boolean;
  mealDone?: boolean;
  body?: BodyEntry;
};

export const TODAY_ISO = "2026-08-02";

export const today = {
  dateLabel: "8월 2일 일요일",
  greeting: "오늘도 나를 위한\n하루를 시작해볼까요?",
  selfLoveMessage: "It doesn't have to be perfect — showing up is what counts.",
  completionRate: 72,
  memo: "런지할 때 무릎 안 아팠던 게 뿌듯. 물을 평소보다 더 챙겨 마심.",
};

export const completionMessages: { min: number; message: string }[] = [
  { min: 100, message: "오늘의 나를 완벽하게 챙겼어요." },
  { min: 50, message: "벌써 절반보다 훨씬 더 해냈어요." },
  { min: 0, message: "작은 것 하나부터 시작해봐요." },
];

export const todayExercises: Exercise[] = [
  {
    id: "squat",
    name: "스쿼트",
    bodyPart: "하체",
    targetSets: 4,
    targetReps: 12,
    weightKg: null,
    restSeconds: 60,
    sets: [true, true, true, false],
  },
  {
    id: "hip-abduction",
    name: "힙 어브덕션",
    bodyPart: "하체",
    targetSets: 4,
    targetReps: 15,
    weightKg: null,
    restSeconds: 45,
    sets: [true, true, true, true],
  },
  {
    id: "lunge",
    name: "런지",
    bodyPart: "하체",
    targetSets: 3,
    targetReps: 10,
    weightKg: null,
    restSeconds: 60,
    sets: [true, true, false],
  },
  {
    id: "hip-thrust",
    name: "힙 스러스트",
    bodyPart: "하체",
    targetSets: 4,
    targetReps: 12,
    weightKg: 40,
    restSeconds: 90,
    sets: [false, false, false, false],
    memo: "허리 뜨지 않게 주의",
  },
];

export const routines: Routine[] = [
  { id: "lower", name: "하체 운동", days: ["월", "목", "일"], active: true },
  { id: "upper", name: "상체 운동", days: ["화", "금"], active: false },
  { id: "full", name: "전신 운동", days: ["수"], active: false },
  { id: "home", name: "홈트레이닝", days: ["토"], active: false },
];

export const water = {
  goalMl: 2000,
  cupMl: 250,
  currentMl: 1400,
  entries: [
    { time: "07:40", amountMl: 250 },
    { time: "10:15", amountMl: 250 },
    { time: "13:05", amountMl: 250 },
    { time: "15:30", amountMl: 250 },
    { time: "17:50", amountMl: 400 },
  ] satisfies WaterEntry[],
};

export const meals: MealEntry[] = [
  {
    type: "morning",
    label: "morning",
    filled: true,
    time: "08:10",
    description: "그릭요거트, 블루베리, 그래놀라",
    fullness: "적당함",
    mood: "가볍고 좋음",
  },
  {
    type: "lunch",
    label: "lunch",
    filled: true,
    time: "12:40",
    description: "현미밥, 닭가슴살 샐러드",
    fullness: "적당함",
    mood: "든든함",
  },
  { type: "dinner", label: "dinner", filled: false },
  { type: "snack", label: "snack", filled: false },
];

// Weight tracking is independent of body_entries (photos) — 기획안 doesn't
// bundle weight into the 눈바디 table, so it stays as its own mock slice.
export const bodyLog = {
  weightKg: 55.4,
  startWeightKg: 56.2,
  goalWeightKg: 53,
  note: "정면만 기록했어요 · 측면·후면은 아직이에요",
};

export const bodyEntries: BodyEntry[] = [
  {
    date: "2026-07-26",
    dateLabel: "7월 26일",
    front: true,
    side: true,
    back: false,
  },
  {
    date: "2026-07-28",
    dateLabel: "7월 28일",
    front: true,
    side: true,
    back: true,
    memo: "3면 모두 기록 완료",
  },
  {
    date: "2026-08-01",
    dateLabel: "8월 1일",
    front: true,
    side: true,
    back: false,
  },
  {
    date: TODAY_ISO,
    dateLabel: "8월 2일",
    front: true,
    side: false,
    back: false,
  },
];

export const todayBodyEntry: BodyEntry | null =
  bodyEntries.find((e) => e.date === TODAY_ISO) ?? null;

export const stats = {
  workout: { completed: 9, total: 12 },
  waterL: 1.4,
  waterGoalL: 2,
  meals: { completed: 2, total: 4 },
};

export const profile = {
  nickname: "여름",
  goalWeightKg: null as number | null,
  waterGoalMl: 2000,
  weeklyWorkoutGoal: 4,
  focusArea: "하체 · 코어",
  goalPeriod: "12주",
};

function seededRate(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return Math.floor((x - Math.floor(x)) * 101);
}

export function buildAugustCalendar(): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let d = 1; d <= 31; d++) {
    const isRest = d % 7 === 3;
    const isFuture = d > 2;
    const isoDate = `2026-08-${String(d).padStart(2, "0")}`;
    const rate = isFuture ? null : isRest ? 0 : seededRate(d);
    days.push({
      date: d,
      isoDate,
      completionRate: rate,
      isToday: d === 2,
      isRestDay: isRest,
      workoutDone: rate !== null && rate > 30,
      waterDone: rate !== null && rate > 45,
      mealDone: rate !== null && rate > 15,
      body: bodyEntries.find((e) => e.date === isoDate),
    });
  }
  return days;
}

export const monthlyReport = {
  avgCompletion: 68,
  workoutDays: 14,
  waterGoalDays: 11,
  mealLogDays: 18,
  bodyPhotoDays: 6,
  bestStreakDay: "월요일",
};
