"use client";

import { EQUIPMENT_OPTIONS, WEEKDAYS_EN, WEEKDAY_EN_TO_KO } from "@/lib/aiRoutine/types";
import type { Equipment, WeekdayEn } from "@/lib/aiRoutine/types";
import { SESSION_MINUTES_OPTIONS } from "@/lib/onboarding/types";
import type { ExperienceLevel, SessionMinutes, WorkoutDaysPerWeek, WorkoutPlace } from "@/lib/onboarding/types";

const PLACE_OPTIONS: { value: WorkoutPlace; label: string }[] = [
  { value: "gym", label: "Gym" },
  { value: "home", label: "Home" },
  { value: "both", label: "Both" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "처음 시작해요" },
  { value: "some", label: "조금 해봤어요" },
  { value: "consistent", label: "꾸준히 운동하고 있어요" },
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
  place,
  minutesPerSession,
  experience,
  equipment,
  onChange,
}: {
  workoutDays: WeekdayEn[];
  place: WorkoutPlace | null;
  minutesPerSession: SessionMinutes | null;
  experience: ExperienceLevel | null;
  equipment: Equipment[];
  onChange: (patch: {
    workoutDays?: WeekdayEn[];
    daysPerWeek?: WorkoutDaysPerWeek;
    place?: WorkoutPlace;
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
        운동 요일, 장소, 시간을 알려주세요
      </h1>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">운동 가능한 요일을 선택해주세요</p>
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
              {WEEKDAY_EN_TO_KO[day]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">어디에서 운동하나요?</p>
        <ChoiceRow options={PLACE_OPTIONS} value={place} onSelect={(v) => onChange({ place: v })} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">한 번에 얼마나 운동할 수 있나요?</p>
        <ChoiceRow
          options={SESSION_MINUTES_OPTIONS.map((m) => ({ value: m, label: `${m} min` }))}
          value={minutesPerSession}
          onSelect={(v) => onChange({ minutesPerSession: v })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">현재 운동 경험은 어느 정도인가요?</p>
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
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">사용 가능한 운동기구 (선택)</p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleEquipment(opt.value)}
              className={`rounded-full px-4 py-2.5 text-[13px] ${
                equipment.includes(opt.value) ? "pill-selected" : "pill-unselected"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
