"use server";

import { generateWeeklyRoutine } from "./generateWeeklyRoutine";
import type { AIRoutineWeek, RoutineGenerationInput } from "./types";

export type GenerateWeeklyRoutineResult = { ok: true; week: AIRoutineWeek } | { ok: false; error: string };

/**
 * Server Action wrapper for Guide's (and, once retrofitted, onboarding's)
 * client-side generation call. Catches and returns errors instead of
 * throwing across the action boundary — in production Next.js redacts
 * thrown Server Action errors down to a generic message, which would bury
 * the specific "AI가 요일을 다르게 반환했어요" text generateWeeklyRoutine
 * throws.
 */
export async function generateWeeklyRoutineAction(
  input: RoutineGenerationInput,
): Promise<GenerateWeeklyRoutineResult> {
  try {
    const week = await generateWeeklyRoutine(input);
    return { ok: true, week };
  } catch (error) {
    console.error("[aiRoutine] generateWeeklyRoutine failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "루틴 생성에 실패했어요." };
  }
}
