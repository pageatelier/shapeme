import type { MealLog } from "@/lib/meal/types";
import type { MovementLog } from "@/lib/movement/types";
import type { WaterLog } from "@/lib/water/types";

/** One day's cell in My's compact records calendar — just enough to color it. */
export type RecordCalendarDay = {
  date: number; // day of month, 1-31
  isoDate: string;
  isToday: boolean;
  /** "오늘의 루틴" %, null for future days (not yet computable/shown). */
  routinePercent: number | null;
};

export type RecordDetail = {
  isoDate: string;
  isFuture: boolean;
  hasAnyRecord: boolean;
  routinePercent: number;
  body: {
    frontImageUrl?: string;
    sideImageUrl?: string;
    backImageUrl?: string;
  } | null;
  move: {
    routineName: string | null;
    doneSets: number;
    totalSets: number;
    movementLogs: MovementLog[];
  } | null;
  /** Already filtered to filled meals — empty when meal tracking is off. */
  meals: MealLog[];
  /** Null when water tracking is off, or nothing was logged that day. */
  water: { entries: WaterLog[]; totalMl: number; goalMl: number; pct: number } | null;
};
