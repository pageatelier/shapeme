"use client";

import { CheckIcon, DumbbellIcon, NoteIcon } from "@/components/icons";
import type { RoutinePreference } from "@/lib/onboarding/draft";

const OPTIONS: {
  value: RoutinePreference;
  title: string;
  description: string;
  icon: typeof DumbbellIcon;
  comingSoon?: boolean;
}[] = [
  {
    value: "create_for_me",
    title: "Create a routine for me",
    description: "Answer a few questions about your goals, schedule, and equipment — we'll build your first week.",
    icon: DumbbellIcon,
  },
  {
    value: "own_routine",
    title: "I have my own routine",
    description: "Already following a plan? Type it in or import it from a photo, and we'll set it up for you.",
    icon: NoteIcon,
    // Path B (type/paste + photo import) isn't built yet — shown so the
    // roadmap is visible, but disabled rather than a clickable dead end
    // that just leaves the guest on a "we'll pick this up next" message.
    comingSoon: true,
  },
];

/**
 * Step 2 of the guest-first flow, the fork between Path A (deterministic
 * generateStartingWeek(), Phase 1/2) and Path B (type/paste + photo import,
 * Phase 6 — not built yet, disabled below). Only patches
 * draft.routinePreference here; which path actually renders next is
 * decided by the flow wrapper.
 */
export function RoutinePreferenceStep({
  value,
  onChange,
}: {
  value: RoutinePreference | null;
  onChange: (preference: RoutinePreference) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[13px] font-semibold text-text-secondary">One more thing before we start</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text-primary">How do you want to work out?</h1>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={opt.comingSoon}
              onClick={() => onChange(opt.value)}
              className="glass-card flex items-start gap-3 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{ outline: selected ? "2px solid var(--color-ink)" : "2px solid transparent", outlineOffset: "1px" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--surface-solid)" }}
              >
                <Icon className="h-4.5 w-4.5 text-text-secondary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[14px] font-bold text-text-primary">{opt.title}</p>
                  {opt.comingSoon && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-text-secondary"
                      style={{ background: "var(--surface-solid)" }}
                    >
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">{opt.description}</p>
              </div>
              {!opt.comingSoon && (
                <div
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: selected ? "var(--color-ink)" : "transparent",
                    border: selected ? "none" : "1.5px solid var(--glass-border)",
                  }}
                >
                  {selected && <CheckIcon className="h-3 w-3 text-white" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
