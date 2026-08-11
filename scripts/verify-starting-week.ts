/**
 * Representative test scenarios for Routine Generator v1
 * (src/lib/onboarding/generateStartingWeek.ts). No test framework exists in
 * this project yet, so this is a plain script with manual assertions —
 * run with `npx tsx scripts/verify-starting-week.ts`. Exits non-zero on
 * any failure so it's CI-friendly even without a real runner.
 */
import { UNSURE_EQUIPMENT_PRESET } from "../src/lib/aiRoutine/types";
import type { Equipment, WeekdayEn } from "../src/lib/aiRoutine/types";
import { generateStartingWeek } from "../src/lib/onboarding/generateStartingWeek";
import { EXERCISE_LIBRARY } from "../src/lib/onboarding/exercises";
import { DEFAULT_ONBOARDING_PROFILE } from "../src/lib/onboarding/types";
import type { ExperienceLevel, FocusArea, OnboardingProfile } from "../src/lib/onboarding/types";

const EXERCISE_BY_NAME = new Map(EXERCISE_LIBRARY.map((e) => [e.name, e]));

let failures = 0;
function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function profile(overrides: Partial<OnboardingProfile>): OnboardingProfile {
  return { ...DEFAULT_ONBOARDING_PROFILE, ...overrides };
}

const ALL_WEEKDAYS: WeekdayEn[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const FULL_GYM_EQUIPMENT: Equipment[] = [
  "bodyweight",
  "dumbbell",
  "barbell",
  "smith_machine",
  "cable",
  "bench",
  "resistance_band",
  "kettlebell",
  "leg_press",
  "leg_curl",
  "leg_extension",
  "hip_abductor",
  "lat_pulldown",
  "seated_row",
  "machine",
];

function workoutDaysOf(weeks: ReturnType<typeof generateStartingWeek>) {
  return weeks.filter((d) => d.dayType !== "rest");
}

// --- Scenario 1: every daysPerWeek value produces exactly that many
// scheduled days, with no exercise repeated twice in the same day, and
// every picked exercise's equipment actually satisfied. ---
console.log("\n1) Each daysPerWeek value (2/3/4/5)");
for (const days of [2, 3, 4, 5] as const) {
  const workoutDays: WeekdayEn[] = ALL_WEEKDAYS.slice(0, days);
  const week = generateStartingWeek(
    profile({
      workoutDays,
      daysPerWeek: days,
      place: "gym",
      minutesPerSession: 45,
      experience: "occasional",
      equipment: FULL_GYM_EQUIPMENT,
      focusAreas: ["glutes"],
    }),
  );
  const scheduled = workoutDaysOf(week);
  check(`${days}x/week schedules exactly ${days} workout day(s)`, scheduled.length === days);
  for (const day of scheduled) {
    const names = day.exercises.map((e) => e.name);
    check(`${days}x — ${day.weekday} (${day.label}) has no duplicate exercises`, new Set(names).size === names.length);
    for (const ex of day.exercises) {
      const template = EXERCISE_BY_NAME.get(ex.name);
      check(
        `${days}x — ${day.weekday}'s "${ex.name}" has a known template`,
        !!template,
        `not found in EXERCISE_LIBRARY`,
      );
      if (!template) continue;
      const satisfied = template.equipment.every((eq) => FULL_GYM_EQUIPMENT.includes(eq));
      check(`${days}x — "${ex.name}" equipment is satisfied`, satisfied, `requires ${template.equipment.join(", ")}`);
    }
  }
}

// --- Scenario 2: protecting a common area (shoulder) shouldn't wipe out
// an entire muscle group — upper-body-heavy days should still come back
// non-empty, since most shoulder cautions in the library are "review"
// severity, not "exclude". ---
console.log("\n2) Protected area doesn't wipe out a whole muscle group");
{
  const week = generateStartingWeek(
    profile({
      workoutDays: ["monday", "tuesday", "thursday", "friday"],
      daysPerWeek: 4,
      place: "gym",
      minutesPerSession: 45,
      experience: "occasional",
      equipment: FULL_GYM_EQUIPMENT,
      focusAreas: ["shoulders"],
      cautions: ["shoulder"],
    }),
  );
  const scheduled = workoutDaysOf(week);
  const upperDays = scheduled.filter((d) => d.dayType === "upper_body" || d.dayType === "back_shoulders" || d.dayType === "arms_shoulders");
  check("at least one upper-body-family day is scheduled", upperDays.length > 0);
  for (const day of upperDays) {
    check(`${day.weekday} (${day.label}) still has exercises despite protected shoulder`, day.exercises.length > 0);
  }
}

// --- Scenario 3: "I'm not sure" equipment preset still produces a full,
// non-empty week. ---
console.log('\n3) "I\'m not sure" equipment preset');
{
  const week = generateStartingWeek(
    profile({
      workoutDays: ["monday", "wednesday", "friday"],
      daysPerWeek: 3,
      place: "gym",
      minutesPerSession: 45,
      experience: "new",
      equipment: UNSURE_EQUIPMENT_PRESET,
      focusAreas: ["glutes"],
    }),
  );
  const scheduled = workoutDaysOf(week);
  check("3x/week still schedules 3 days on the unsure preset", scheduled.length === 3);
  for (const day of scheduled) {
    check(`${day.weekday} (${day.label}) has exercises on the unsure preset`, day.exercises.length > 0);
  }
}

// --- Scenario 4: each experience tier's difficulty/volume rules. ---
console.log("\n4) Experience tiers: difficulty + volume");
const tierCases: { tier: ExperienceLevel; minutes: number; expectedCount: number }[] = [
  { tier: "new", minutes: 30, expectedCount: 4 },
  { tier: "new", minutes: 60, expectedCount: 5 }, // capped lower than the 6 a non-new tier gets at 60min
  { tier: "occasional", minutes: 45, expectedCount: 5 },
  { tier: "consistent", minutes: 60, expectedCount: 6 },
  { tier: "experienced", minutes: 90, expectedCount: 7 },
];
for (const { tier, minutes, expectedCount } of tierCases) {
  const week = generateStartingWeek(
    profile({
      workoutDays: ["monday", "wednesday", "friday"],
      daysPerWeek: 3,
      place: "gym",
      minutesPerSession: minutes as OnboardingProfile["minutesPerSession"],
      experience: tier,
      equipment: FULL_GYM_EQUIPMENT,
      focusAreas: ["glutes"],
    }),
  );
  const day = workoutDaysOf(week)[0];
  check(
    `${tier} @ ${minutes}min gets ${expectedCount} exercises`,
    day.exercises.length === expectedCount,
    `got ${day.exercises.length}`,
  );
  if (tier === "new") {
    for (const ex of day.exercises) {
      const template = EXERCISE_BY_NAME.get(ex.name);
      check(`${tier} — "${ex.name}" is beginner-difficulty`, template?.difficulty === "beginner");
    }
  }
}

// --- Scenario 5: multiple selected focus areas (up to 3) still produce a
// valid week, distributing emphasis rather than crashing on the combo. ---
console.log("\n5) Multiple Focus Areas (up to 3) don't crash");
{
  const focusAreas: FocusArea[] = ["glutes", "shoulders", "core"];
  const week = generateStartingWeek(
    profile({
      workoutDays: ["monday", "tuesday", "thursday", "friday"],
      daysPerWeek: 4,
      place: "gym",
      minutesPerSession: 60,
      experience: "occasional",
      equipment: FULL_GYM_EQUIPMENT,
      focusAreas,
    }),
  );
  const scheduled = workoutDaysOf(week);
  check("4 days scheduled with 3 combined focus areas", scheduled.length === 4);
  for (const day of scheduled) {
    check(`${day.weekday} (${day.label}) is non-empty`, day.exercises.length > 0);
  }
}

console.log(failures === 0 ? "\nAll scenarios passed.\n" : `\n${failures} assertion(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
