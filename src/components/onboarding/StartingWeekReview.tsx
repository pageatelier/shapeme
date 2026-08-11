"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, PlusIcon } from "@/components/icons";
import type { ExerciseTemplate, StartingWeight } from "@/lib/onboarding/exercises";
import {
  addExercise,
  changeDayDuration,
  changeWorkoutDay,
  editExerciseVolume,
  getAddExerciseCandidates,
  removeExercise,
  reorderExercise,
  replaceExercise,
} from "@/lib/onboarding/generateStartingWeek";
import type { StartingWeekDay, StartingWeekExercise } from "@/lib/onboarding/generateStartingWeek";
import { SESSION_MINUTES_OPTIONS } from "@/lib/onboarding/types";
import type { OnboardingProfile } from "@/lib/onboarding/types";

/** Turns the structured StartingWeight into display copy — the data itself
 * stays structured (see exercises.ts's StartingWeight doc) so this is the
 * one place that has to know how to phrase each variant. */
function formatStartingWeight(weight: StartingWeight): string {
  switch (weight.type) {
    case "weight_range":
      return weight.perHand ? `${weight.minKg}–${weight.maxKg} kg each` : `${weight.minKg}–${weight.maxKg} kg`;
    case "bodyweight":
      return "Bodyweight";
    case "lightest_available":
      return "Lightest available";
    case "light_band":
      return "Light band";
    case "high_assistance":
      return "High assistance";
  }
}

/** 90 stands in for "75+" — SESSION_MINUTES_OPTIONS has no literal 75, same
 * convention the generator's own duration bucketing uses. */
function durationLabel(minutes: number): string {
  return minutes >= 90 ? "75+ min" : `${minutes} min`;
}

/** Shared portal-overlay shell for the three pickers below — escapes to
 * document.body for the same reason every other full-screen overlay in
 * this app does (see LiveCameraCapture/BodyFeedViewer's doc comments):
 * a fixed-position element nested inside a positioned ancestor can't
 * reliably out-rank sibling content otherwise. Onboarding has no BottomNav
 * to clash with, but the portal keeps this consistent with the rest of
 * the app's overlay pattern rather than being a one-off exception. */
function PickerSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(33, 31, 28, 0.6)" }}>
      <button type="button" aria-label="Close" className="flex-1 cursor-default" onClick={onClose} />
      <div
        className="flex max-h-[70vh] flex-col gap-3 rounded-t-[var(--radius-xl)] p-5"
        style={{ background: "var(--glass-background-strong)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-text-primary">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "var(--surface-card)" }}
          >
            <CloseIcon className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function AddExercisePicker({
  day,
  profile,
  onPick,
  onClose,
}: {
  day: StartingWeekDay;
  profile: OnboardingProfile;
  onPick: (template: ExerciseTemplate) => void;
  onClose: () => void;
}) {
  const candidates = getAddExerciseCandidates(day, profile);
  return (
    <PickerSheet title="Add an exercise" onClose={onClose}>
      {candidates.length === 0 && (
        <p className="py-4 text-center text-[12px] text-text-muted">No exercises available to add.</p>
      )}
      {candidates.map((template) => (
        <button
          key={template.name}
          type="button"
          onClick={() => onPick(template)}
          className="rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[13px] text-text-primary"
          style={{ background: "var(--surface-card)" }}
        >
          {template.name}
          <span className="ml-2 text-[11px] text-text-muted">{template.target.join(", ")}</span>
        </button>
      ))}
    </PickerSheet>
  );
}

function ChangeDayPicker({
  week,
  day,
  onPick,
  onClose,
}: {
  week: StartingWeekDay[];
  day: StartingWeekDay;
  onPick: (targetWeekday: string) => void;
  onClose: () => void;
}) {
  const otherDays = week.filter((d) => d.weekday !== day.weekday);
  return (
    <PickerSheet title="Change day" onClose={onClose}>
      {otherDays.map((target) => (
        <button
          key={target.weekday}
          type="button"
          onClick={() => onPick(target.weekday)}
          className="flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[13px] text-text-primary"
          style={{ background: "var(--surface-card)" }}
        >
          <span>{target.weekday}</span>
          <span className="text-[11px] text-text-muted">{target.label}</span>
        </button>
      ))}
    </PickerSheet>
  );
}

function ChangeDurationPicker({
  current,
  onPick,
  onClose,
}: {
  current: number | null;
  onPick: (minutes: number) => void;
  onClose: () => void;
}) {
  return (
    <PickerSheet title="Change duration" onClose={onClose}>
      {SESSION_MINUTES_OPTIONS.map((minutes) => (
        <button
          key={minutes}
          type="button"
          onClick={() => onPick(minutes)}
          className={`rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[13px] ${
            minutes === current ? "pill-selected" : "text-text-primary"
          }`}
          style={minutes === current ? undefined : { background: "var(--surface-card)" }}
        >
          {durationLabel(minutes)}
        </button>
      ))}
    </PickerSheet>
  );
}

function ExerciseRow({
  exercise,
  isEditing,
  canMoveUp,
  canMoveDown,
  onEditToggle,
  onSave,
  onReplace,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  exercise: StartingWeekExercise;
  isEditing: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEditToggle: () => void;
  onSave: (patch: { targetSets: number; repsMin: number; repsMax: number }) => void;
  onReplace: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-md)] p-2.5" style={{ background: "var(--surface-card)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-[13px] text-text-primary">
            {exercise.name} — {exercise.targetSets} × {exercise.repsMin}–{exercise.repsMax}
          </p>
          <p className="text-[11px] text-text-muted">Suggested start: {formatStartingWeight(exercise.startingWeight)}</p>
        </div>
        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Move up"
            className="disabled:opacity-30"
          >
            <ChevronUpIcon className="h-3.5 w-3.5 text-text-muted" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Move down"
            className="disabled:opacity-30"
          >
            <ChevronDownIcon className="h-3.5 w-3.5 text-text-muted" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <form
          className="mt-2 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            onSave({
              targetSets: Number(data.get("sets")),
              repsMin: Number(data.get("repsMin")),
              repsMax: Number(data.get("repsMax")),
            });
          }}
        >
          <label className="flex flex-col gap-0.5 text-[10px] text-text-muted">
            Sets
            <input
              name="sets"
              type="number"
              min={1}
              max={6}
              defaultValue={exercise.targetSets}
              className="w-14 rounded-[var(--radius-sm)] px-2 py-1 text-[12px] text-text-primary"
              style={{ background: "var(--color-bg)", border: "var(--border-soft)" }}
            />
          </label>
          <label className="flex flex-col gap-0.5 text-[10px] text-text-muted">
            Min reps
            <input
              name="repsMin"
              type="number"
              min={1}
              max={30}
              defaultValue={exercise.repsMin}
              className="w-14 rounded-[var(--radius-sm)] px-2 py-1 text-[12px] text-text-primary"
              style={{ background: "var(--color-bg)", border: "var(--border-soft)" }}
            />
          </label>
          <label className="flex flex-col gap-0.5 text-[10px] text-text-muted">
            Max reps
            <input
              name="repsMax"
              type="number"
              min={1}
              max={30}
              defaultValue={exercise.repsMax}
              className="w-14 rounded-[var(--radius-sm)] px-2 py-1 text-[12px] text-text-primary"
              style={{ background: "var(--color-bg)", border: "var(--border-soft)" }}
            />
          </label>
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-inverse"
            style={{ background: "var(--color-ink)" }}
          >
            Save
          </button>
          <button type="button" onClick={onEditToggle} className="text-[11px] font-semibold text-text-muted">
            Cancel
          </button>
        </form>
      ) : (
        <div className="mt-2 flex flex-wrap gap-3">
          <button type="button" onClick={onEditToggle} className="text-[11px] font-semibold text-pink-500">
            Edit
          </button>
          <button type="button" onClick={onReplace} className="text-[11px] font-semibold text-pink-500">
            Replace
          </button>
          <button type="button" onClick={onReplace} className="text-[11px] font-semibold text-text-muted">
            Not available
          </button>
          <button type="button" onClick={onRemove} className="text-[11px] font-semibold text-error">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function DayCard({
  day,
  week,
  profile,
  onChange,
  onWeekChange,
}: {
  day: StartingWeekDay;
  week: StartingWeekDay[];
  profile: OnboardingProfile;
  onChange: (next: StartingWeekDay) => void;
  onWeekChange: (next: StartingWeekDay[]) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  if (day.dayType === "rest") {
    return (
      <div className="glass-card p-4">
        <p className="text-[13px] font-bold text-text-primary">{day.weekday} · {day.label}</p>
        <p className="text-[12px] text-text-muted">Rest / gentle movement</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold text-text-primary">{day.weekday} · {day.label}</p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            {day.minutes} min · {day.exercises.length} exercises
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button type="button" onClick={() => setShowDurationPicker(true)} className="text-[11px] font-semibold text-pink-500">
            Change duration
          </button>
          <button type="button" onClick={() => setShowDayPicker(true)} className="text-[11px] font-semibold text-pink-500">
            Change day
          </button>
        </div>
      </div>

      {day.warmup.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[12px] font-semibold text-text-secondary">Warm-up</p>
          {day.warmup.map((w) => (
            <p key={w} className="text-[12px] text-text-secondary">
              {w}
            </p>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {day.exercises.map((exercise, index) => (
          <ExerciseRow
            key={`${exercise.name}-${index}`}
            exercise={exercise}
            isEditing={editingIndex === index}
            canMoveUp={index > 0}
            canMoveDown={index < day.exercises.length - 1}
            onEditToggle={() => setEditingIndex((prev) => (prev === index ? null : index))}
            onSave={(patch) => {
              onChange(editExerciseVolume(day, index, patch));
              setEditingIndex(null);
            }}
            onReplace={() => onChange(replaceExercise(day, index, profile))}
            onRemove={() => onChange(removeExercise(day, index))}
            onMoveUp={() => onChange(reorderExercise(day, index, index - 1))}
            onMoveDown={() => onChange(reorderExercise(day, index, index + 1))}
          />
        ))}
        {day.exercises.length === 0 && (
          <p className="py-2 text-center text-[12px] text-text-muted">All exercises for this day have been removed.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowAddPicker(true)}
        className="mt-3 flex min-h-[36px] items-center justify-center gap-1.5 rounded-[var(--radius-md)] text-[12px] font-semibold text-text-secondary"
        style={{ border: "1px dashed var(--glass-border)" }}
      >
        <PlusIcon className="h-3 w-3" />
        Add an exercise
      </button>

      {showAddPicker && (
        <AddExercisePicker
          day={day}
          profile={profile}
          onPick={(template) => {
            onChange(addExercise(day, template, profile));
            setShowAddPicker(false);
          }}
          onClose={() => setShowAddPicker(false)}
        />
      )}
      {showDayPicker && (
        <ChangeDayPicker
          week={week}
          day={day}
          onPick={(targetWeekday) => {
            onWeekChange(changeWorkoutDay(week, day.weekday, targetWeekday));
            setShowDayPicker(false);
          }}
          onClose={() => setShowDayPicker(false)}
        />
      )}
      {showDurationPicker && (
        <ChangeDurationPicker
          current={day.minutes}
          onPick={(minutes) => {
            onChange(changeDayDuration(day, minutes, profile));
            setShowDurationPicker(false);
          }}
          onClose={() => setShowDurationPicker(false)}
        />
      )}
    </div>
  );
}

/**
 * ⑦ — Starting Week output, now editable (Phase 2): per-exercise Edit
 * (sets/reps), Replace/Not available (both swap to the next eligible
 * candidate — see replaceExercise()'s doc for why they share one
 * function), Remove, and up/down Reorder; day-level Add an exercise,
 * Change workout day (swaps two days' full content), and Change duration
 * (re-derives that day's exercise count/sets for the new duration). Every
 * action is a pure transform from src/lib/onboarding/generateStartingWeek.ts
 * — this component just calls one and replaces its `week` prop via
 * `onWeekChange`, no separate edit-mode state of its own beyond which
 * picker/row is open.
 */
export function StartingWeekReview({
  week,
  onWeekChange,
  profile,
  onStart,
  starting,
  error,
}: {
  week: StartingWeekDay[];
  onWeekChange: (next: StartingWeekDay[]) => void;
  profile: OnboardingProfile;
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  const workoutDays = week.filter((day) => day.dayType !== "rest");

  function updateDay(weekday: string, next: StartingWeekDay) {
    onWeekChange(week.map((d) => (d.weekday === weekday ? next : d)));
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Full photo, uncropped (natural aspect ratio, not force-cropped into
          a fixed-height banner) — bleeds edge-to-edge via negative margin,
          then fades to var(--color-bg) at the bottom so the heading below
          can pull up into the fade zone (-mt-8) and overlap it naturally
          instead of meeting it at a hard seam. */}
      <div className="-mx-5 -mb-2 w-[calc(100%+2.5rem)]">
        <div className="relative">
          <Image
            src="/onboading-images/startweek.webp"
            alt=""
            width={650}
            height={1407}
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            className="h-auto w-full"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-28"
            style={{ background: "linear-gradient(180deg, transparent 0%, var(--color-bg) 100%)" }}
          />
        </div>
      </div>

      <div className="relative z-10 -mt-8 text-center">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Your first week is ready.</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
          You don&apos;t need to start perfectly.
          <br />
          This week, let&apos;s find movement that feels right for you.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {week.map((day) => (
          <DayCard
            key={day.weekday}
            day={day}
            week={week}
            profile={profile}
            onChange={(next) => updateDay(day.weekday, next)}
            onWeekChange={onWeekChange}
          />
        ))}
      </div>

      {workoutDays.length === 0 && (
        <p className="text-center text-[12px] text-error">
          You don&apos;t have any workout days this week. Go back and select your days.
        </p>
      )}

      <p className="text-center text-[11px] text-text-muted">
        Starting weights are a guide — adjust them freely as you go.
      </p>

      {error && <p className="text-center text-[12px] text-error">{error}</p>}

      <button
        type="button"
        onClick={onStart}
        disabled={starting || workoutDays.length === 0}
        className="flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
      >
        {starting ? "Saving..." : "Use this starting week"}
      </button>
    </div>
  );
}
