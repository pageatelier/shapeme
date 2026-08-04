"use client";

import { useRef, useState } from "react";
import { CameraIcon } from "@/components/icons";

const GOAL_OPTIONS = ["체지방 감량", "힙업", "복부 라인", "자세 개선", "건강한 습관"] as const;
const PERIOD_OPTIONS = ["2주", "1개월", "3개월"] as const;

/**
 * All state here is local UI-only — nothing is persisted or sent anywhere.
 * Wiring this up to a real plan-generation call later just means replacing
 * `onCreatePlan`'s body; the fields it would read (goal/period/photos) are
 * already collected here.
 */
export function GoalSection({ onCreatePlan }: { onCreatePlan: () => void }) {
  const [goal, setGoal] = useState<(typeof GOAL_OPTIONS)[number] | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [goalIsCustom, setGoalIsCustom] = useState(false);

  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number] | null>(null);
  const [customPeriod, setCustomPeriod] = useState("");
  const [periodIsCustom, setPeriodIsCustom] = useState(false);

  return (
    <section className="glass-card p-6">
      <p className="text-[19px] font-bold tracking-[-0.02em] text-text-primary">목표</p>
      <p className="mt-1.5 mb-5 text-[13px] leading-relaxed text-text-secondary">
        목표를 설정하면 AI가 나에게 맞는 계획을 만들어드립니다.
      </p>

      <div className="mb-5">
        <p className="mb-2 text-[13px] font-bold text-text-primary">목표 선택</p>
        <div className="flex flex-wrap gap-1.5">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setGoal(option);
                setGoalIsCustom(false);
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] ${!goalIsCustom && goal === option ? "pill-selected" : "pill-unselected"}`}
            >
              {option}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setGoalIsCustom(true)}
            className={`rounded-full px-3 py-1.5 text-[12px] ${goalIsCustom ? "pill-selected" : "pill-unselected"}`}
          >
            직접 입력
          </button>
        </div>
        {goalIsCustom && (
          <input
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="원하는 목표를 적어주세요"
            className="mt-2 min-h-[44px] w-full rounded-[var(--radius-md)] px-4 text-[13px] text-text-primary outline-none"
            style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
          />
        )}
      </div>

      <div className="mb-5">
        <p className="mb-2 text-[13px] font-bold text-text-primary">목표 기간</p>
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setPeriod(option);
                setPeriodIsCustom(false);
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] ${!periodIsCustom && period === option ? "pill-selected" : "pill-unselected"}`}
            >
              {option}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPeriodIsCustom(true)}
            className={`rounded-full px-3 py-1.5 text-[12px] ${periodIsCustom ? "pill-selected" : "pill-unselected"}`}
          >
            직접 설정
          </button>
        </div>
        {periodIsCustom && (
          <input
            value={customPeriod}
            onChange={(e) => setCustomPeriod(e.target.value)}
            placeholder="예: 6주"
            className="mt-2 min-h-[44px] w-full rounded-[var(--radius-md)] px-4 text-[13px] text-text-primary outline-none"
            style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
          />
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <PhotoPickCard label="현재 몸 사진" caption="현재 몸 상태를 참고하여 맞춤 계획을 생성합니다." />
        <PhotoPickCard label="목표 사진" caption="원하는 몸의 방향을 참고하여 맞춤 계획을 생성합니다." />
      </div>

      <button
        type="button"
        onClick={onCreatePlan}
        className="flex min-h-[52px] w-full items-center justify-center rounded-full text-[15px] font-bold text-text-inverse"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
      >
        내 계획 만들기
      </button>
    </section>
  );
}

/** Local-preview-only picker — like BodyCapture/MealCard's upload tiles, but
 * with no upload target yet, so it just shows the picked photo via a blob:
 * URL and goes no further. */
function PhotoPickCard({ label, caption }: { label: string; caption: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handlePick(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[12px] font-semibold text-text-secondary">{label} (선택)</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
        style={preview ? undefined : { background: "var(--surface-card)", border: "1px dashed rgba(86, 62, 58, 0.18)" }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`${label} 미리보기`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-text-muted">
            <CameraIcon className="h-6 w-6" />
            <span className="text-[11px] font-semibold">사진 선택</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePick(e.target.files?.[0])}
      />
      <p className="text-[10px] leading-relaxed text-text-muted">{caption}</p>
    </div>
  );
}
