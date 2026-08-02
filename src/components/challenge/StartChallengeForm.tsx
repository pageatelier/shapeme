"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeftIcon, DumbbellIcon, HeartIcon } from "@/components/icons";
import { createChallengeWithProgram } from "@/lib/challenge/mutations";
import {
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  type ChallengeGoal,
  type ChallengeSetupInput,
  type ExperienceLevel,
  type WorkoutLocation,
} from "@/lib/challenge/types";

const totalSteps = 5;

const goals = Object.entries(GOAL_LABELS) as [ChallengeGoal, string][];
const experiences = Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, string][];

export function StartChallengeForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ChallengeSetupInput>({
    goal: "glutes",
    heightCm: 164,
    startWeightKg: 55,
    experienceLevel: "intermediate",
    workoutDaysPerWeek: 3,
    sessionMinutes: 50,
    workoutLocation: "gym",
    equipment: ["머신", "덤벨", "케이블"],
    limitations: "",
  });

  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step]);

  function patch<T extends keyof ChallengeSetupInput>(key: T, value: ChallengeSetupInput[T]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function next() {
    setError(null);
    setStep((current) => Math.min(totalSteps, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      const equipment =
        form.workoutLocation === "home"
          ? ["맨몸"]
          : form.workoutLocation === "gym"
            ? ["머신", "덤벨", "케이블"]
            : ["머신", "덤벨", "케이블", "맨몸"];
      await createChallengeWithProgram({ ...form, equipment });
      router.push("/body?setup=1");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "프로그램을 만드는 중 문제가 생겼어요. Supabase 마이그레이션을 확인해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-[440px] flex-col">
      <div className="mb-6 flex items-center justify-between">
        {step === 1 ? (
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full surface-card" aria-label="홈으로">
            <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
          </Link>
        ) : (
          <button type="button" onClick={back} className="flex h-10 w-10 items-center justify-center rounded-full surface-card" aria-label="이전 단계">
            <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
          </button>
        )}
        <p className="font-en text-[11px] font-semibold tracking-[0.12em] text-text-muted uppercase">
          {step} / {totalSteps}
        </p>
      </div>

      <div className="mb-8 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--progress-track)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--gradient-primary)" }} />
      </div>

      <div className="flex-1">
        {step === 1 && (
          <StepShell eyebrow="Shape Me in 100 Days" title="100일 뒤, 달라진 나를 만나볼까요?" description="목표와 운동 환경을 알려주면 100일 동안 반복할 고정 프로그램을 만들어드려요.">
            <div className="grid gap-3">
              <IntroRow icon={<DumbbellIcon className="h-5 w-5" />} title="고정 프로그램" text="매일 바뀌지 않고 같은 루틴을 꾸준히 발전시켜요." />
              <IntroRow icon={<HeartIcon className="h-5 w-5" />} title="쉬어도 이어지는 여정" text="아프거나 생리로 힘든 날은 회복일로 남길 수 있어요." />
              <IntroRow icon={<span className="font-en text-sm font-bold">100</span>} title="눈에 보이는 변화" text="Day 1 사진과 현재 사진을 나란히 비교해요." />
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell eyebrow="Your goal" title="가장 원하는 변화를 골라주세요" description="첫 프로그램의 운동 비중을 정하는 기준이에요.">
            <div className="grid gap-3">
              {goals.map(([value, label]) => (
                <ChoiceButton key={value} active={form.goal === value} onClick={() => patch("goal", value)} title={label} />
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell eyebrow="Starting point" title="현재 상태를 알려주세요" description="숫자는 평가가 아니라 100일 변화의 시작점을 남기기 위해 사용해요.">
            <div className="glass-card grid gap-5 p-6">
              <NumberField label="키" value={form.heightCm} suffix="cm" min={120} max={220} step={1} onChange={(value) => patch("heightCm", value)} />
              <NumberField label="현재 체중" value={form.startWeightKg} suffix="kg" min={30} max={200} step={0.1} onChange={(value) => patch("startWeightKg", value)} />
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell eyebrow="Workout style" title="내 생활에 맞는 운동량을 정해요" description="너무 빡빡한 계획보다 실제로 지킬 수 있는 계획이 좋아요.">
            <div className="flex flex-col gap-5">
              <OptionGroup label="운동 경험">
                {experiences.map(([value, label]) => (
                  <ChoiceButton key={value} compact active={form.experienceLevel === value} onClick={() => patch("experienceLevel", value)} title={label} />
                ))}
              </OptionGroup>
              <OptionGroup label="주당 운동 횟수">
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((value) => (
                    <ChoiceButton key={value} compact active={form.workoutDaysPerWeek === value} onClick={() => patch("workoutDaysPerWeek", value)} title={`주 ${value}회`} />
                  ))}
                </div>
              </OptionGroup>
              <OptionGroup label="한 번에 가능한 시간">
                <div className="grid grid-cols-3 gap-2">
                  {[30, 50, 70].map((value) => (
                    <ChoiceButton key={value} compact active={form.sessionMinutes === value} onClick={() => patch("sessionMinutes", value)} title={`${value}분`} />
                  ))}
                </div>
              </OptionGroup>
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell eyebrow="Your program" title="마지막으로 운동 환경을 확인할게요" description="완료하면 프로그램을 만들고 Day 1 눈바디 촬영으로 이어져요.">
            <div className="flex flex-col gap-5">
              <OptionGroup label="운동 장소">
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["gym", "헬스장"],
                    ["home", "집"],
                    ["both", "둘 다"],
                  ] as [WorkoutLocation, string][]).map(([value, label]) => (
                    <ChoiceButton key={value} compact active={form.workoutLocation === value} onClick={() => patch("workoutLocation", value)} title={label} />
                  ))}
                </div>
              </OptionGroup>

              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-text-secondary">아프거나 불편한 부위 (선택)</span>
                <textarea
                  value={form.limitations}
                  onChange={(event) => patch("limitations", event.target.value)}
                  placeholder="예: 오른쪽 무릎이 가끔 불편해요"
                  rows={3}
                  className="resize-none rounded-[var(--radius-lg)] px-4 py-3 text-[14px] leading-relaxed text-text-primary outline-none"
                  style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
                />
              </label>

              <div className="glass-card p-5">
                <p className="mb-1 text-[15px] font-bold text-text-primary">{GOAL_LABELS[form.goal]} 프로그램</p>
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  주 {form.workoutDaysPerWeek}회 · 회당 약 {form.sessionMinutes}분 · 100일 고정 루틴
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  {form.workoutLocation === "home"
                    ? "맨몸 중심 홈트 프로그램"
                    : form.workoutLocation === "gym"
                      ? "머신·덤벨·케이블 중심 헬스장 프로그램"
                      : "헬스장 중심 + 집에서도 이어갈 수 있는 프로그램"}
                </p>
              </div>
            </div>
          </StepShell>
        )}
      </div>

      {error && <p className="mt-5 rounded-[var(--radius-md)] bg-error-soft px-4 py-3 text-[12px] leading-relaxed text-error">{error}</p>}

      <button
        type="button"
        onClick={step === totalSteps ? finish : next}
        disabled={saving}
        className="mt-7 min-h-[56px] w-full rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
      >
        {saving ? "100일 프로그램 만드는 중..." : step === totalSteps ? "프로그램 만들고 Day 1 촬영하기" : step === 1 ? "100일 시작하기" : "다음"}
      </button>
    </div>
  );
}

function StepShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.13em] text-pink-500 uppercase">{eyebrow}</p>
      <h1 className="mb-3 text-[30px] leading-[1.22] font-bold tracking-[-0.055em] text-text-primary">{title}</h1>
      <p className="mb-8 text-[14px] leading-[1.7] text-text-secondary">{description}</p>
      {children}
    </section>
  );
}

function IntroRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card flex items-start gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-pink-500" style={{ background: "var(--color-pink-100)" }}>{icon}</div>
      <div>
        <p className="mb-1 text-[14px] font-bold text-text-primary">{title}</p>
        <p className="text-[12px] leading-relaxed text-text-secondary">{text}</p>
      </div>
    </div>
  );
}

function ChoiceButton({ active, onClick, title, compact = false }: { active: boolean; onClick: () => void; title: string; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${compact ? "min-h-[46px] px-3 text-[13px]" : "min-h-[58px] px-5 text-left text-[15px]"} rounded-[var(--radius-lg)] font-bold transition-transform active:scale-[0.99]`}
      style={active ? { background: "var(--gradient-primary)", color: "var(--color-text-inverse)", boxShadow: "var(--shadow-pink)" } : { background: "var(--surface-card)", color: "var(--color-text-primary)", border: "var(--border-soft)" }}
    >
      {title}
    </button>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-bold text-text-secondary">{label}</p>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

function NumberField({ label, value, suffix, min, max, step, onChange }: { label: string; value: number; suffix: string; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-end justify-between gap-4">
      <span className="text-[13px] font-bold text-text-secondary">{label}</span>
      <span className="flex items-baseline gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-24 border-0 bg-transparent text-right text-[30px] font-semibold tracking-[-0.05em] text-text-primary outline-none"
        />
        <span className="font-en text-[13px] text-text-muted">{suffix}</span>
      </span>
    </label>
  );
}
