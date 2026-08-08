"use client";

import { SESSION_MINUTES_OPTIONS, WORKOUT_DAYS_OPTIONS } from "@/lib/onboarding/types";
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
  daysPerWeek,
  place,
  minutesPerSession,
  experience,
  onChange,
}: {
  daysPerWeek: WorkoutDaysPerWeek | null;
  place: WorkoutPlace | null;
  minutesPerSession: SessionMinutes | null;
  experience: ExperienceLevel | null;
  onChange: (patch: {
    daysPerWeek?: WorkoutDaysPerWeek;
    place?: WorkoutPlace;
    minutesPerSession?: SessionMinutes;
    experience?: ExperienceLevel;
  }) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">
        운동 횟수, 장소, 시간을 알려주세요
      </h1>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-text-secondary">일주일에 몇 번 운동하고 싶나요?</p>
        <ChoiceRow
          options={WORKOUT_DAYS_OPTIONS.map((d) => ({ value: d, label: `${d} days` }))}
          value={daysPerWeek}
          onSelect={(v) => onChange({ daysPerWeek: v })}
        />
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
    </div>
  );
}
