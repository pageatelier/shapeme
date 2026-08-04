"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { PlusIcon, SettingsIcon } from "@/components/icons";
import { ActivityTypePicker } from "@/components/move/ActivityTypePicker";
import { MovementLogCard } from "@/components/move/MovementLogCard";
import { MovementLogForm } from "@/components/move/MovementLogForm";
import { weekdayIndex } from "@/lib/body/date";
import type { MovementActivityType, MovementLog } from "@/lib/movement/types";
import { WEEKDAYS } from "@/lib/workout/types";
import type { WorkoutRoutine } from "@/lib/workout/types";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseForm } from "./ExerciseForm";

function todayWeekdayLabel(date: string) {
  return WEEKDAYS[weekdayIndex(date)];
}

function SettingsLink() {
  return (
    <Link
      href="/move/settings"
      aria-label="루틴 관리"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary"
      style={{ background: "rgba(255,255,255,0.72)", border: "var(--border-soft)" }}
    >
      <SettingsIcon className="h-4 w-4" />
    </Link>
  );
}

export function WorkoutView({
  routines,
  date,
  movementLogs,
}: {
  routines: WorkoutRoutine[];
  date: string;
  movementLogs: MovementLog[];
}) {
  const todayLabel = todayWeekdayLabel(date);
  // Every routine scheduled for today, not just one — routines can share a
  // day (e.g. 월,목 힙 + 월,화 어깨 both apply on 월), so each gets its own
  // block below instead of picking a single "active" tab.
  const todayRoutines = routines.filter((r) => r.days.includes(todayLabel));

  const [addingExerciseFor, setAddingExerciseFor] = useState<string | null>(null);
  const [exerciseEditMode, setExerciseEditMode] = useState(false);

  const [addingMovement, setAddingMovement] = useState(false);
  const [pickedType, setPickedType] = useState<MovementActivityType | null>(null);

  // Exercise-card set toggles are optimistic/local (no router.refresh()), so
  // without this the top routine-progress % wouldn't move until something
  // else happened to trigger a refresh. Keyed by exercise id and merged over
  // exercise.sets below.
  const [liveDoneByExercise, setLiveDoneByExercise] = useState<Record<string, number>>({});
  // Stable identity (no deps) so it doesn't defeat ExerciseCard's memo.
  const handleSetsChange = useCallback((exerciseId: string, sets: boolean[]) => {
    setLiveDoneByExercise((prev) => ({ ...prev, [exerciseId]: sets.filter(Boolean).length }));
  }, []);

  function closeMovementFlow() {
    setAddingMovement(false);
    setPickedType(null);
  }

  // "오늘의 다른 움직임" — today's simple (non-strength) movement logs, the
  // add-flow (type picker → duration/optional-memo form), and the CTA.
  // Rendered regardless of whether any strength routine is scheduled today,
  // since logging a run/walk shouldn't require one.
  const movementSection = (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">오늘의 다른 움직임</p>
        <p className="mt-0.5 text-[12px] text-text-secondary">루틴 외에 가볍게 움직인 순간도 기록해요.</p>
      </div>
      {movementLogs.map((log) => (
        <MovementLogCard key={log.id} log={log} date={date} />
      ))}
      {addingMovement ? (
        pickedType ? (
          <MovementLogForm date={date} activityType={pickedType} onDone={closeMovementFlow} />
        ) : (
          <ActivityTypePicker onSelect={setPickedType} />
        )
      ) : (
        <button
          type="button"
          onClick={() => setAddingMovement(true)}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--radius-lg)] text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--color-peach-100)", border: "1px dashed rgba(86, 62, 58, 0.12)" }}
        >
          <PlusIcon className="h-4 w-4" />
          다른 움직임 기록
        </button>
      )}
    </div>
  );

  if (routines.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Move</h1>
          <SettingsLink />
        </div>
        <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-[15px] font-bold text-text-primary">아직 운동 루틴이 없어요</p>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            루틴 관리에서 요일별 루틴을 만들어보세요.
          </p>
          <Link
            href="/move/settings"
            className="mt-1 rounded-full px-4 py-2 text-[13px] font-bold text-text-inverse"
            style={{ background: "var(--gradient-primary)" }}
          >
            루틴 관리로 이동
          </Link>
        </div>
        {movementSection}
      </div>
    );
  }

  const totalSets = todayRoutines.reduce(
    (sum, r) => sum + r.exercises.reduce((s, e) => s + e.targetSets, 0),
    0,
  );
  const doneSets = todayRoutines.reduce(
    (sum, r) =>
      sum + r.exercises.reduce((s, e) => s + (liveDoneByExercise[e.id] ?? e.sets.filter(Boolean).length), 0),
    0,
  );
  const progress = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Move</h1>
        <SettingsLink />
      </div>

      {todayRoutines.length > 0 ? (
        <div className="glass-card p-4">
          <p className="mb-2 text-[13px] font-bold text-text-primary">오늘의 루틴</p>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <p className="min-w-0 truncate text-[14px] font-semibold text-text-secondary">
              {todayRoutines.map((r) => r.name).join(", ")}
            </p>
            <p className="font-en shrink-0 text-lg font-bold tracking-[-0.03em] text-text-primary">{progress}%</p>
          </div>
          <p className="mb-3 text-[12px] text-text-muted">
            {doneSets} / {totalSets}세트 완료
          </p>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
            />
          </div>
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-[13px] font-semibold text-text-primary">오늘은 예정된 루틴이 없어요</p>
          <Link href="/move/settings" className="text-[12px] font-semibold text-pink-500">
            루틴 관리에서 요일 확인하기
          </Link>
        </div>
      )}

      {todayRoutines.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">오늘의 운동</p>
          <button
            type="button"
            onClick={() => setExerciseEditMode((v) => !v)}
            className={`text-[12px] font-semibold ${exerciseEditMode ? "text-pink-500" : "text-text-muted"}`}
          >
            운동 편집
          </button>
        </div>
      )}

      {todayRoutines.map((routine) => (
        <div key={routine.id} className="flex flex-col gap-2">
          {todayRoutines.length > 1 && (
            <p className="text-[13px] font-semibold text-text-secondary">{routine.name}</p>
          )}

          <div className="flex flex-col gap-2">
            {routine.exercises.map((exercise, i) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                date={date}
                orderIndex={i}
                editMode={exerciseEditMode}
                onSetsChange={handleSetsChange}
                prevId={i > 0 ? routine.exercises[i - 1].id : undefined}
                prevOrderIndex={i > 0 ? routine.exercises[i - 1].orderIndex : undefined}
                nextId={i < routine.exercises.length - 1 ? routine.exercises[i + 1].id : undefined}
                nextOrderIndex={i < routine.exercises.length - 1 ? routine.exercises[i + 1].orderIndex : undefined}
              />
            ))}
            {routine.exercises.length === 0 && addingExerciseFor !== routine.id && (
              <p className="surface-card p-4 text-center text-[13px] text-text-muted">
                이 루틴에 운동을 추가해보세요.
              </p>
            )}
          </div>

          {addingExerciseFor === routine.id ? (
            <div className="glass-card p-5">
              <ExerciseForm
                routineId={routine.id}
                orderIndex={routine.exercises.length}
                onDone={() => setAddingExerciseFor(null)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingExerciseFor(routine.id)}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-lg)] text-[13px] font-semibold text-text-secondary"
              style={{ background: "var(--color-peach-100)", border: "1px dashed rgba(86, 62, 58, 0.12)" }}
            >
              <PlusIcon className="h-4 w-4" />이 루틴에 운동 추가
            </button>
          )}
        </div>
      ))}

      {movementSection}
    </div>
  );
}
