"use client";

import { useState } from "react";
import { generateWeeklyRoutineAction } from "@/lib/aiRoutine/actions";
import {
  EQUIPMENT_OPTIONS,
  FOCUS_AREA_OPTIONS,
  WEEKDAYS_EN,
  WEEKDAY_EN_TO_KO,
} from "@/lib/aiRoutine/types";
import type {
  AIRoutineWeek,
  Equipment,
  ExperienceLevel,
  FocusArea,
  WeekdayEn,
  WorkoutPlace,
} from "@/lib/aiRoutine/types";
import { AiRoutineWeekResult } from "./AiRoutineWeekResult";

const SESSION_MINUTES_OPTIONS = [30, 45, 60, 90];
const PLACE_OPTIONS: { value: WorkoutPlace; label: string }[] = [
  { value: "home", label: "홈트" },
  { value: "gym", label: "헬스장" },
  { value: "both", label: "둘 다" },
];
const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "처음 시작해요" },
  { value: "some", label: "조금 해봤어요" },
  { value: "consistent", label: "꾸준히 하고 있어요" },
];
const AVOID_PRESETS = ["무릎", "허리", "어깨", "손목"];
const MAX_FOCUS_AREAS = 3;

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] ${selected ? "pill-selected" : "pill-unselected"}`}
    >
      {children}
    </button>
  );
}

/**
 * Guide's "AI 가이드" entry point for the weekday-based routine generator
 * (src/lib/aiRoutine/) — collects the 8 inputs, calls the real OpenAI
 * service via generateWeeklyRoutineAction, then hands the result to
 * AiRoutineWeekResult for review + save. Replaces the old static demo
 * (canned example, no real call) that lived here before.
 */
export function AiGuideSection() {
  const [workoutDays, setWorkoutDays] = useState<WeekdayEn[]>([]);
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const [place, setPlace] = useState<WorkoutPlace | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [avoidAreas, setAvoidAreas] = useState<string[]>([]);
  const [avoidInput, setAvoidInput] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [week, setWeek] = useState<AIRoutineWeek | null>(null);

  const canGenerate = workoutDays.length > 0 && sessionMinutes !== null && place !== null && experience !== null;

  function toggleDay(day: WeekdayEn) {
    setWorkoutDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function toggleFocus(area: FocusArea) {
    setFocusAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : prev.length >= MAX_FOCUS_AREAS
          ? prev
          : [...prev, area],
    );
  }

  function toggleEquipment(item: Equipment) {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  }

  function addGoal() {
    const trimmed = goalInput.trim();
    if (!trimmed || goals.includes(trimmed)) return;
    setGoals((prev) => [...prev, trimmed]);
    setGoalInput("");
  }

  function toggleAvoidPreset(area: string) {
    setAvoidAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  function addAvoidCustom() {
    const trimmed = avoidInput.trim();
    if (!trimmed || avoidAreas.includes(trimmed)) return;
    setAvoidAreas((prev) => [...prev, trimmed]);
    setAvoidInput("");
  }

  async function handleGenerate() {
    if (!canGenerate || sessionMinutes === null || place === null || experience === null) return;
    setGenerating(true);
    setError(null);
    const result = await generateWeeklyRoutineAction({
      workoutDays,
      sessionMinutes,
      place,
      goals,
      focusAreas,
      avoidAreas,
      experience,
      equipment,
    });
    setGenerating(false);
    if (result.ok) {
      setWeek(result.week);
    } else {
      setError(result.error);
    }
  }

  if (week) {
    return (
      <section className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">AI 루틴</p>
          <button
            type="button"
            onClick={() => setWeek(null)}
            className="text-[11px] font-semibold text-text-muted"
          >
            다시 만들기
          </button>
        </div>
        <AiRoutineWeekResult week={week} />
      </section>
    );
  }

  return (
    <section className="glass-card p-5">
      <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">AI 루틴 만들기</p>
      <p className="mt-1 mb-4 text-[13px] text-text-secondary">
        운동 가능한 요일과 상황을 알려주시면 한 주 루틴을 만들어드려요.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">운동 가능한 요일 (필수)</p>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS_EN.map((day) => (
              <Chip key={day} selected={workoutDays.includes(day)} onClick={() => toggleDay(day)}>
                {WEEKDAY_EN_TO_KO[day]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">1회 운동 가능 시간</p>
          <div className="flex flex-wrap gap-1.5">
            {SESSION_MINUTES_OPTIONS.map((m) => (
              <Chip key={m} selected={sessionMinutes === m} onClick={() => setSessionMinutes(m)}>
                {m}분
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">운동 장소</p>
          <div className="flex flex-wrap gap-1.5">
            {PLACE_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={place === opt.value} onClick={() => setPlace(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">운동 목표 (선택)</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {goals.map((g) => (
              <Chip key={g} selected onClick={() => setGoals((prev) => prev.filter((x) => x !== g))}>
                {g}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGoal();
                }
              }}
              placeholder="예: 탄탄하고 강한 몸"
              className="min-h-[40px] flex-1 rounded-full px-3 text-[13px] text-text-primary outline-none"
              style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
            />
            <button
              type="button"
              onClick={addGoal}
              disabled={!goalInput.trim()}
              className="min-h-[36px] rounded-full px-3 text-[12px] font-semibold text-text-secondary disabled:opacity-40"
              style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
            >
              추가
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">
            집중하고 싶은 부위 (선택, 최대 {MAX_FOCUS_AREAS}개)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_AREA_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={focusAreas.includes(opt.value)} onClick={() => toggleFocus(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">피하고 싶은/불편한 부위 (선택)</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {AVOID_PRESETS.map((area) => (
              <Chip key={area} selected={avoidAreas.includes(area)} onClick={() => toggleAvoidPreset(area)}>
                {area}
              </Chip>
            ))}
            {avoidAreas
              .filter((a) => !AVOID_PRESETS.includes(a))
              .map((a) => (
                <Chip key={a} selected onClick={() => toggleAvoidPreset(a)}>
                  {a}
                </Chip>
              ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={avoidInput}
              onChange={(e) => setAvoidInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAvoidCustom();
                }
              }}
              placeholder="직접 입력"
              className="min-h-[40px] flex-1 rounded-full px-3 text-[13px] text-text-primary outline-none"
              style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
            />
            <button
              type="button"
              onClick={addAvoidCustom}
              disabled={!avoidInput.trim()}
              className="min-h-[36px] rounded-full px-3 text-[12px] font-semibold text-text-secondary disabled:opacity-40"
              style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
            >
              추가
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">운동 경험 수준</p>
          <div className="flex flex-wrap gap-1.5">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={experience === opt.value} onClick={() => setExperience(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold text-text-primary">사용 가능한 운동기구 (선택)</p>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={equipment.includes(opt.value)} onClick={() => toggleEquipment(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-[12px] text-error">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || generating}
        className="mt-4 min-h-[48px] w-full rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-50"
        style={{ background: "var(--gradient-primary)" }}
      >
        {generating ? "루틴 만드는 중..." : "루틴 생성하기"}
      </button>
    </section>
  );
}
