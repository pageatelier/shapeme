"use client";

import { EQUIPMENT_OPTIONS, UNSURE_EQUIPMENT_PRESET, WEEKDAYS_EN } from "@/lib/aiRoutine/types";
import type { Equipment, WeekdayEn } from "@/lib/aiRoutine/types";
import { SESSION_MINUTES_OPTIONS } from "@/lib/onboarding/types";
import type { ExperienceLevel, SessionMinutes, WorkoutDaysPerWeek } from "@/lib/onboarding/types";

/** Display-only English abbreviation for the day-picker buttons — the
 * underlying `workoutDays: WeekdayEn[]` state is already English
 * ("monday", ...), this is purely what's shown on the pill. */
const WEEKDAY_SHORT_LABEL: Record<WeekdayEn, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

/** Gym vs. home grouping is purely presentational — both write into the
 * same flat `equipment: Equipment[]` the generator filters on. Dumbbells
 * live in the home group even though gyms have them too, to avoid
 * rendering (and needing to keep in sync) two buttons for one value. */
const GYM_EQUIPMENT: Equipment[] = [
  "barbell",
  "smith_machine",
  "cable",
  "leg_press",
  "leg_curl",
  "leg_extension",
  "hip_abductor",
  "lat_pulldown",
  "seated_row",
  "machine",
];
const HOME_EQUIPMENT: Equipment[] = ["dumbbell", "bench", "resistance_band", "kettlebell", "bodyweight"];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; helper: string }[] = [
  { value: "new", label: "New to training", helper: "I'm just getting started." },
  { value: "occasional", label: "Occasionally", helper: "I work out from time to time." },
  { value: "consistent", label: "Consistently", helper: "Movement is already part of my routine." },
  { value: "experienced", label: "Experienced", helper: "I'm comfortable with structured training." },
];

function ChoiceRow<T extends string | number>({
  options,
  value,
  onSelect,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={`rounded-full px-4 py-2.5 text-[13px] ${
            value === opt.value ? "pill-selected" : "pill-unselected"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function WorkoutLogisticsStep({
  workoutDays,
  minutesPerSession,
  experience,
  equipment,
  onChange,
}: {
  workoutDays: WeekdayEn[];
  minutesPerSession: SessionMinutes | null;
  experience: ExperienceLevel | null;
  equipment: Equipment[];
  onChange: (patch: {
    workoutDays?: WeekdayEn[];
    daysPerWeek?: WorkoutDaysPerWeek;
    minutesPerSession?: SessionMinutes;
    experience?: ExperienceLevel;
    equipment?: Equipment[];
  }) => void;
}) {
  function toggleDay(day: WeekdayEn) {
    const next = workoutDays.includes(day) ? workoutDays.filter((d) => d !== day) : [...workoutDays, day];
    // daysPerWeek stays in sync purely for the older count-based mock
    // generator (My's Weekly Review) — the real generator reads workoutDays
    // directly and ignores this. Clamped to 2-5 since that generator only
    // understands those counts; picking 1, 6, or 7 real days just maps to
    // the nearest supported count for that unrelated legacy path.
    const clampedCount = Math.min(5, Math.max(2, next.length)) as WorkoutDaysPerWeek;
    onChange({ workoutDays: next, daysPerWeek: clampedCount });
  }

  function toggleEquipment(item: Equipment) {
    onChange({ equipment: equipment.includes(item) ? equipment.filter((e) => e !== item) : [...equipment, item] });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">
        Which days work for you this week?
      </h1>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">Select the days that work for you</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS_EN.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`rounded-full px-4 py-2.5 text-[13px] ${
                workoutDays.includes(day) ? "pill-selected" : "pill-unselected"
              }`}
            >
              {WEEKDAY_SHORT_LABEL[day]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">How much time do you have for each workout?</p>
        <ChoiceRow
          options={SESSION_MINUTES_OPTIONS.map((m) => ({ value: m, label: `${m} min` }))}
          value={minutesPerSession}
          onSelect={(v) => onChange({ minutesPerSession: v })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">How familiar does training feel?</p>
        <div className="flex flex-col gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ experience: opt.value })}
              className={`rounded-[var(--radius-md)] px-4 py-3 text-left text-[13px] ${
                experience === opt.value ? "pill-selected" : "pill-unselected"
              }`}
            >
              <span className="font-semibold">{opt.label}</span>
              <span className="ml-1.5 opacity-75">{opt.helper}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-text-secondary">What equipment can you use? (optional)</p>
          <button
            type="button"
            onClick={() => onChange({ equipment: UNSURE_EQUIPMENT_PRESET })}
            className="text-[12px] font-semibold text-pink-500"
          >
            I&apos;m not sure
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] text-text-muted">Gym</p>
          <div className="flex flex-wrap gap-2">
            {GYM_EQUIPMENT.map((value) => {
              const opt = EQUIPMENT_OPTIONS.find((o) => o.value === value)!;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleEquipment(value)}
                  className={`rounded-full px-4 py-2.5 text-[13px] ${
                    equipment.includes(value) ? "pill-selected" : "pill-unselected"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] text-text-muted">Home</p>
          <div className="flex flex-wrap gap-2">
            {HOME_EQUIPMENT.map((value) => {
              const opt = EQUIPMENT_OPTIONS.find((o) => o.value === value)!;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleEquipment(value)}
                  className={`rounded-full px-4 py-2.5 text-[13px] ${
                    equipment.includes(value) ? "pill-selected" : "pill-unselected"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
