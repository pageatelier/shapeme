/**
 * Representative test scenarios for Routine Generator v1
 * (src/lib/onboarding/generateStartingWeek.ts). No test framework exists in
 * this project yet, so this is a plain script with manual assertions —
 * run with `npx tsx scripts/verify-starting-week.ts`. Exits non-zero on
 * any failure so it's CI-friendly even without a real runner.
 */
import { UNSURE_EQUIPMENT_PRESET } from "../src/lib/aiRoutine/types";
import type { Equipment, WeekdayEn } from "../src/lib/aiRoutine/types";
import {
  addExercise,
  changeDayDuration,
  changeWorkoutDay,
  editExerciseVolume,
  generateStartingWeek,
  getAddExerciseCandidates,
  removeExercise,
  reorderExercise,
  replaceExercise,
} from "../src/lib/onboarding/generateStartingWeek";
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
      const satisfied = template.equipment.required.every((eq) => FULL_GYM_EQUIPMENT.includes(eq));
      check(
        `${days}x — "${ex.name}" required equipment is satisfied`,
        satisfied,
        `requires ${template.equipment.required.join(", ")}`,
      );
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

// --- Scenario 4: exact main-exercise count table (duration bucket ×
// experience tier) — the same persona checked across all 4 durations, per
// the confirmed target table. Warm-up/cool-down never count toward this. ---
console.log("\n4) Exact main-exercise count table (same persona across 30/45/60/75+)");
const MAIN_EXERCISE_COUNT: Record<number, Record<ExperienceLevel, number>> = {
  30: { new: 4, occasional: 4, consistent: 4, experienced: 4 },
  45: { new: 5, occasional: 5, consistent: 5, experienced: 5 },
  60: { new: 5, occasional: 6, consistent: 6, experienced: 6 },
  90: { new: 5, occasional: 6, consistent: 7, experienced: 7 }, // 90 stands in for "75+" — SESSION_MINUTES_OPTIONS has no literal 75
};
const TIERS: ExperienceLevel[] = ["new", "occasional", "consistent", "experienced"];
const DURATIONS = [30, 45, 60, 90] as const;

for (const tier of TIERS) {
  for (const minutes of DURATIONS) {
    const expectedCount = MAIN_EXERCISE_COUNT[minutes][tier];
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
      `${tier} @ ${minutes}min → exactly ${expectedCount} main exercises`,
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
}

// --- Scenario 4b: thin equipment (bodyweight-only) falls back to any
// compatible exercise for the workout type rather than duplicating a
// movement or silently coming up short — this was the bug the user found
// (a 60min bodyweight-only day was coming back with only 2-3 exercises
// instead of the target). Fixed by two changes together: the fallback
// logic itself, and re-auditing the library so squat/lunge/hinge exercises
// (Reverse Lunge, Walking Lunge, Bulgarian Split Squat, Curtsy Lunge,
// Romanian Deadlift, Goblet Squat, Step Up) require only bodyweight/a bench
// with their dumbbell as optional added load rather than a hard
// requirement — Lower Body's bodyweight-eligible pool went from 2 exercises
// to enough to hit the target exactly, same as Full Body. ---
console.log("\n4b) Thin equipment (bodyweight-only) falls back without duplicating");
{
  const fullBodyWeek = generateStartingWeek(
    profile({
      workoutDays: ["monday", "wednesday", "friday"],
      daysPerWeek: 3,
      place: "home",
      minutesPerSession: 60,
      experience: "occasional",
      equipment: ["bodyweight"],
      focusAreas: ["full_body"],
    }),
  );
  const fullBodyDay = workoutDaysOf(fullBodyWeek)[0];
  check(
    "bodyweight-only Full Body @ 60min/occasional reaches the exact target (6) via fallback",
    fullBodyDay.exercises.length === 6,
    `got ${fullBodyDay.exercises.length}`,
  );

  const lowerBodyWeek = generateStartingWeek(
    profile({
      workoutDays: ["monday", "wednesday", "friday"],
      daysPerWeek: 3,
      place: "home",
      minutesPerSession: 60,
      experience: "occasional",
      equipment: ["bodyweight"],
      focusAreas: ["glutes"],
    }),
  );
  const lowerBodyDay = lowerBodyWeek.find((d) => d.dayType === "lower_body")!;
  const names = lowerBodyDay.exercises.map((e) => e.name);
  check("bodyweight-only Lower Body has no duplicate exercises", new Set(names).size === names.length);
  check(
    "bodyweight-only Lower Body @ 60min/occasional reaches the exact target (6) after the required/optional-load audit",
    lowerBodyDay.exercises.length === 6,
    `got ${lowerBodyDay.exercises.length}`,
  );
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

// --- Scenario 6: "bodyweight" is never a real equipment requirement, even
// when it's not explicitly ticked — everyone has their own body regardless
// of which gym machines they selected. This was a real user report: gym
// equipment picked (leg press, lat pulldown, dumbbell) without ticking a
// "bodyweight" checkbox produced a Lower Body day with only 1 exercise
// (Leg Press), because required=["bodyweight"] on several exercises (the
// squat/lunge/hinge audit from Scenario 4b) was being treated like any
// other missing equipment instead of being implicitly always available. ---
console.log('\n6) "bodyweight" is implicitly available even when not selected');
{
  const week = generateStartingWeek(
    profile({
      workoutDays: ["monday", "wednesday", "friday"],
      daysPerWeek: 3,
      place: "gym",
      minutesPerSession: 30,
      experience: "occasional",
      equipment: ["leg_press", "lat_pulldown", "dumbbell"], // deliberately no "bodyweight"
      focusAreas: [],
    }),
  );
  const lowerBodyDay = workoutDaysOf(week).find((d) => d.dayType === "lower_body")!;
  check(
    "Lower Body @ 30min still reaches the target (4) without an explicit bodyweight selection",
    lowerBodyDay.exercises.length === 4,
    `got ${lowerBodyDay.exercises.length}`,
  );
}

// --- Scenario 7: week-level variety — a supporting exercise shouldn't
// repeat across two days that share an exercise pool (Lower Body and
// Glutes both draw from squat/lunge/hinge exercises), but the day's own
// anchor movement (slot 0, the one that gets extra sets) SHOULD be free to
// repeat across the week — that's normal programming (e.g. Hip Thrust
// showing up on both a Lower day and a Glutes day), not a bug. This was a
// direct user request after seeing near-identical Monday/Thursday
// exercise lists. ---
console.log("\n7) Week-level variety: anchor lift can repeat, supporting exercises shouldn't");
{
  const week = generateStartingWeek(
    profile({
      workoutDays: ["monday", "tuesday", "thursday", "friday"],
      daysPerWeek: 4,
      place: "gym",
      minutesPerSession: 60,
      experience: "occasional",
      equipment: ["leg_press", "lat_pulldown", "dumbbell", "bench"],
      focusAreas: [],
    }),
  );
  const monday = week.find((d) => d.dayType === "lower_body")!;
  const thursday = week.find((d) => d.dayType === "glutes")!;
  const mondayNames = monday.exercises.map((e) => e.name);
  const thursdayNames = thursday.exercises.map((e) => e.name);

  // With this exact equipment set, Dumbbell Hip Thrust is the priority-1
  // thrust_bridge pick — it should show up as Monday's supporting exercise
  // (Leg Press is Monday's anchor) AND as Thursday's own anchor, appearing
  // in the week twice on purpose.
  check(
    "Dumbbell Hip Thrust appears on both Monday (supporting) and Thursday (anchor)",
    mondayNames.includes("Dumbbell Hip Thrust") && thursdayNames[0] === "Dumbbell Hip Thrust",
    `Monday: ${mondayNames.join(", ")} | Thursday anchor: ${thursdayNames[0]}`,
  );
  const mondaySupporting = mondayNames.slice(1);
  const thursdaySupporting = thursdayNames.slice(1);
  const overlap = thursdaySupporting.filter((n) => mondaySupporting.includes(n));
  check(
    "Monday Lower Body and Thursday Glutes' supporting exercises (slots 1+) mostly don't overlap",
    overlap.length <= 1,
    `overlap: ${overlap.join(", ") || "none"}`,
  );
}

// =============================================================================
// Phase 2 — Starting Week Review edit actions
// =============================================================================

function testWeek(overrides: Partial<OnboardingProfile> = {}) {
  return generateStartingWeek(
    profile({
      workoutDays: ["monday", "wednesday", "friday"],
      daysPerWeek: 3,
      place: "gym",
      minutesPerSession: 60,
      experience: "occasional",
      equipment: FULL_GYM_EQUIPMENT,
      focusAreas: ["glutes"],
      ...overrides,
    }),
  );
}

console.log("\n8) replaceExercise: swaps to a different eligible exercise, never a duplicate");
{
  const week = testWeek();
  const monday = week.find((d) => d.dayType !== "rest")!;
  const p = profile({ equipment: FULL_GYM_EQUIPMENT, experience: "occasional" });
  const originalName = monday.exercises[1].name;
  const replaced = replaceExercise(monday, 1, p);
  const newName = replaced.exercises[1].name;
  check("replaced exercise has a different name", newName !== originalName, `still "${newName}"`);
  const names = replaced.exercises.map((e) => e.name);
  check("no duplicate exercises after replace", new Set(names).size === names.length);
  check("day.dayType/label/weekday untouched by replace", replaced.dayType === monday.dayType && replaced.label === monday.label);
}

console.log("\n9) replaceExercise: respects equipment (only swaps to something the user actually has)");
{
  const week = testWeek({ equipment: ["leg_press", "dumbbell", "bench"] });
  const day = week.find((d) => d.dayType !== "rest")!;
  const p = profile({ equipment: ["leg_press", "dumbbell", "bench"], experience: "occasional" });
  for (let i = 0; i < day.exercises.length; i++) {
    const replaced = replaceExercise(day, i, p);
    const newTemplate = EXERCISE_BY_NAME.get(replaced.exercises[i].name)!;
    const satisfied = newTemplate.equipment.required.every((eq) => eq === "bodyweight" || p.equipment.includes(eq));
    check(`replacing slot ${i} stays within available equipment`, satisfied, `picked "${newTemplate.name}" needs ${newTemplate.equipment.required.join(", ")}`);
  }
}

console.log("\n10) removeExercise: shrinks the day, doesn't touch other exercises");
{
  const week = testWeek();
  const day = week.find((d) => d.dayType !== "rest")!;
  const beforeCount = day.exercises.length;
  const removedName = day.exercises[0].name;
  const next = removeExercise(day, 0);
  check("exercise count decreased by exactly 1", next.exercises.length === beforeCount - 1);
  check("the removed exercise is gone", !next.exercises.some((e) => e.name === removedName));
}

console.log("\n11) addExercise / getAddExerciseCandidates: adds something not already on the day");
{
  const week = testWeek();
  const day = week.find((d) => d.dayType !== "rest")!;
  const p = profile({ equipment: FULL_GYM_EQUIPMENT, experience: "occasional" });
  const candidates = getAddExerciseCandidates(day, p);
  check("candidate list is non-empty", candidates.length > 0);
  check(
    "no candidate is already on the day",
    candidates.every((c) => !day.exercises.some((e) => e.name === c.name)),
  );
  if (candidates.length > 0) {
    const next = addExercise(day, candidates[0], p);
    check("day grew by exactly 1 exercise", next.exercises.length === day.exercises.length + 1);
    check("new exercise is the picked candidate", next.exercises[next.exercises.length - 1].name === candidates[0].name);
  }
}

console.log("\n12) reorderExercise: moves position, preserves each exercise's own sets/reps");
{
  const week = testWeek();
  const day = week.find((d) => d.dayType !== "rest")!;
  const firstName = day.exercises[0].name;
  const firstSets = day.exercises[0].targetSets;
  const next = reorderExercise(day, 0, 2);
  check("moved exercise is now at index 2", next.exercises[2].name === firstName);
  check("moved exercise kept its own sets value (not recomputed by position)", next.exercises[2].targetSets === firstSets);
  check("day still has the same total exercise count", next.exercises.length === day.exercises.length);
}

console.log("\n13) changeWorkoutDay: swaps two days' full content");
{
  const week = testWeek();
  const monday = week.find((d) => d.weekday === "월")!;
  const tuesday = week.find((d) => d.weekday === "화")!;
  const nextWeek = changeWorkoutDay(week, "월", "화");
  const newMonday = nextWeek.find((d) => d.weekday === "월")!;
  const newTuesday = nextWeek.find((d) => d.weekday === "화")!;
  check("Monday now has Tuesday's old content", newMonday.dayType === tuesday.dayType && newMonday.label === tuesday.label);
  check("Tuesday now has Monday's old content", newTuesday.dayType === monday.dayType && newTuesday.label === monday.label);
  check("weekday labels themselves stay put", newMonday.weekday === "월" && newTuesday.weekday === "화");
}

console.log("\n14) changeDayDuration: re-derives exercise count for the new duration");
{
  const week = testWeek({ minutesPerSession: 60, experience: "occasional" });
  const day = week.find((d) => d.dayType !== "rest")!;
  const p = profile({ equipment: FULL_GYM_EQUIPMENT, experience: "occasional" });
  check("starting point is 60min's target (6)", day.exercises.length === 6, `got ${day.exercises.length}`);

  const shrunk = changeDayDuration(day, 30, p);
  check("shrinking to 30min trims to that duration's target (4)", shrunk.exercises.length === 4, `got ${shrunk.exercises.length}`);
  check("shrinking preserves the original first exercises, not a fresh regeneration", shrunk.exercises[0].name === day.exercises[0].name);

  const grown = changeDayDuration(shrunk, 90, p);
  check("growing back to 90min reaches that duration's target (6, occasional)", grown.exercises.length === 6, `got ${grown.exercises.length}`);
  const grownNames = grown.exercises.map((e) => e.name);
  check("growing produces no duplicate exercises", new Set(grownNames).size === grownNames.length);
}

console.log("\n15) editExerciseVolume: direct sets/reps edit, nothing else changes");
{
  const week = testWeek();
  const day = week.find((d) => d.dayType !== "rest")!;
  const originalName = day.exercises[0].name;
  const next = editExerciseVolume(day, 0, { targetSets: 5, repsMin: 12, repsMax: 20 });
  check("targetSets updated", next.exercises[0].targetSets === 5);
  check("repsMin/repsMax updated", next.exercises[0].repsMin === 12 && next.exercises[0].repsMax === 20);
  check("exercise identity unchanged", next.exercises[0].name === originalName);
}

console.log(failures === 0 ? "\nAll scenarios passed.\n" : `\n${failures} assertion(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
