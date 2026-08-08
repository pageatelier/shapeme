import type { StartingWeekDay } from "@/lib/onboarding/generateStartingWeek";

/**
 * Step ⑦'s output — a compact weekday-by-weekday list (day type + duration +
 * exercise count, or "Rest"). Read-only summary; the per-day exercise list
 * and Change/Regenerate/Start actions are step ⑧–⑨, not built yet.
 */
export function StartingWeekSummary({ days }: { days: StartingWeekDay[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-2xl font-bold tracking-[-0.03em] text-text-primary">
        Your Starting Week ♡
      </h1>
      <div className="glass-card flex flex-col divide-y" style={{ borderColor: "var(--glass-border)" }}>
        {days.map((day) => (
          <div key={day.weekday} className="flex items-center justify-between gap-3 p-4">
            <span className="font-en w-8 shrink-0 text-[12px] font-bold text-text-muted">{day.weekday}</span>
            {day.dayType === "rest" ? (
              <span className="flex-1 text-[13px] text-text-muted">{day.label}</span>
            ) : (
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-text-primary">{day.label}</p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  {day.minutes} min · {day.exercises.length} exercises
                </p>
              </div>
            )}
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: day.dayType === "rest" ? "var(--color-bg-warm)" : "var(--gradient-primary)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
