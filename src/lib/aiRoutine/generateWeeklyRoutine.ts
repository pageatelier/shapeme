import OpenAI from "openai";
import { WEEKDAYS_EN } from "./types";
import type { AIRoutineDay, AIRoutineWeek, RoutineGenerationInput } from "./types";

const MODEL = "gpt-5-mini";

const ROUTINE_SCHEMA = {
  type: "object",
  properties: {
    frequency: { type: "integer" },
    workout_days: { type: "array", items: { type: "string", enum: WEEKDAYS_EN } },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "string", enum: WEEKDAYS_EN },
          title: { type: "string" },
          estimated_minutes: { type: "integer" },
          warmup: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, duration_or_reps: { type: "string" } },
              required: ["name", "duration_or_reps"],
              additionalProperties: false,
            },
          },
          workout: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                target_muscle: { type: "string" },
                sets: { type: "integer" },
                reps: { type: "integer" },
                suggested_intensity: { type: "string" },
                rest_seconds: { type: "integer" },
              },
              required: ["name", "target_muscle", "sets", "reps", "suggested_intensity", "rest_seconds"],
              additionalProperties: false,
            },
          },
          cardio: {
            type: "object",
            properties: {
              type: { type: "string" },
              minutes: { type: "integer" },
              intensity: { type: ["string", "null"] },
            },
            required: ["type", "minutes", "intensity"],
            additionalProperties: false,
          },
          cooldown: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                duration_seconds: { type: "integer" },
                target_area: { type: "string" },
              },
              required: ["name", "duration_seconds", "target_area"],
              additionalProperties: false,
            },
          },
        },
        required: ["day", "title", "estimated_minutes", "warmup", "workout", "cardio", "cooldown"],
        additionalProperties: false,
      },
    },
  },
  required: ["frequency", "workout_days", "days"],
  additionalProperties: false,
};

function buildPrompt(input: RoutineGenerationInput): string {
  return `사용자 정보:
- 운동 가능 요일: ${input.workoutDays.join(", ")}
- 1회 운동 가능 시간: ${input.sessionMinutes}분
- 운동 장소: ${input.place}
- 운동 목표: ${input.goals.join(", ") || "명시 안 함"}
- 집중하고 싶은 부위: ${input.focusAreas.join(", ") || "명시 안 함"}
- 피하고 싶은/불편한 부위: ${input.avoidAreas.join(", ") || "없음"}
- 운동 경험 수준: ${input.experience}
- 사용 가능한 운동기구: ${input.equipment.join(", ") || "맨몸만"}

위 정보로 정확히 [${input.workoutDays.join(", ")}] 요일에 대해서만 하루씩 루틴을 만들어줘. 그 외 요일은 절대 포함하지 마.`;
}

const SYSTEM_PROMPT = `너는 ShapeMe 앱의 운동 루틴 코치야. 사용자가 지정한 요일에만 각각 하루치 루틴을 만든다.

규칙:
- 반드시 입력에 주어진 workout_days 요일에 대해서만 하루씩 만들어라. 하나라도 빠지거나 추가되면 안 된다.
- 연속된 날에 같은 근육군을 반복하지 말고, 회복 시간을 고려해 부위를 분산해라.
- 사용자가 밝힌 불편한/피하고 싶은 부위에 부담을 주는 동작은 넣지 마라.
- 사용 가능한 운동기구 안에서만 운동을 구성해라 (맨몸만이면 맨몸 운동만).
- 운동 장소(gym/home/both)에 맞는 현실적인 동작으로 구성해라.
- suggested_intensity는 "가볍게 8kg 정도" 같은 부드러운 제안으로 쓰고, 절대적인 목표처럼 단정적으로 쓰지 마라.
- 그날 유산소가 필요 없으면 cardio.type을 "none", minutes를 0으로 해라.
- title, name, target_muscle, suggested_intensity, target_area 같은 텍스트 필드는 한국어로 써라. day 값만 영문 요일(monday 등)으로 써라.
- 출력은 주어진 JSON 스키마를 정확히 따르는 JSON만 반환해라.`;

function toCamel(day: {
  day: string;
  title: string;
  estimated_minutes: number;
  warmup: { name: string; duration_or_reps: string }[];
  workout: {
    name: string;
    target_muscle: string;
    sets: number;
    reps: number;
    suggested_intensity: string;
    rest_seconds: number;
  }[];
  cardio: { type: string; minutes: number; intensity: string | null };
  cooldown: { name: string; duration_seconds: number; target_area: string }[];
}): AIRoutineDay {
  return {
    day: day.day as AIRoutineDay["day"],
    title: day.title,
    estimatedMinutes: day.estimated_minutes,
    warmup: day.warmup.map((w) => ({ name: w.name, durationOrReps: w.duration_or_reps })),
    workout: day.workout.map((w) => ({
      name: w.name,
      targetMuscle: w.target_muscle,
      sets: w.sets,
      reps: w.reps,
      suggestedIntensity: w.suggested_intensity,
      restSeconds: w.rest_seconds,
    })),
    cardio: { type: day.cardio.type, minutes: day.cardio.minutes, intensity: day.cardio.intensity },
    cooldown: day.cooldown.map((c) => ({ name: c.name, durationSeconds: c.duration_seconds, targetArea: c.target_area })),
  };
}

/**
 * Single service function both Guide and (once retrofitted) onboarding call
 * — the one place a model swap or prompt change needs to happen. Real
 * OpenAI call via Structured Outputs (json_schema, strict mode), so the
 * shape is guaranteed; the one thing strict mode *can't* enforce is "only
 * these specific weekdays" (the enum allows all 7), so that's checked here
 * after the fact — a compliance slip throws rather than silently
 * saving/showing a day the user never asked for.
 */
export async function generateWeeklyRoutine(input: RoutineGenerationInput): Promise<AIRoutineWeek> {
  if (input.workoutDays.length === 0) {
    throw new Error("운동 요일을 최소 1개 이상 선택해주세요.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(input) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "weekly_routine",
        schema: ROUTINE_SCHEMA,
        strict: true,
      },
    },
  });

  let parsed: {
    frequency: number;
    workout_days: string[];
    days: Parameters<typeof toCamel>[0][];
  };
  try {
    parsed = JSON.parse(response.output_text);
  } catch {
    throw new Error("AI 응답을 해석하지 못했어요. 다시 시도해주세요.");
  }

  const requested = new Set(input.workoutDays);
  const returned = new Set(parsed.days.map((d) => d.day));
  const missing = input.workoutDays.filter((d) => !returned.has(d));
  const extra = [...returned].filter((d) => !requested.has(d as (typeof input.workoutDays)[number]));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `AI가 요청한 요일과 다르게 응답했어요 (누락: ${missing.join(", ") || "없음"}, 추가: ${extra.join(", ") || "없음"}). 다시 시도해주세요.`,
    );
  }

  return {
    frequency: parsed.frequency,
    workoutDays: parsed.workout_days as AIRoutineWeek["workoutDays"],
    days: parsed.days.map(toCamel),
  };
}
