"use client";

import { useState } from "react";
import { HourglassIcon, PlusIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";
import { getJourneyProgress } from "@/lib/journey";
import type { BodyEntry } from "@/lib/body/types";
import { BodyCapture } from "./BodyCapture";
import { BodyCompare } from "./BodyCompareLazy";
import { BodyTimeline } from "./BodyTimeline";

type Tab = "thisWeek" | "compare";

/** Owns the This Week/Compare tab state — a client boundary so the tabs can
 * switch without a navigation, while body/page.tsx (Server Component) keeps
 * doing the data fetching. Also owns the header's "+" shortcut, since it
 * just needs to land on the This Week tab where the capture card lives. */
export function BodyView({
  entries,
  startedAt,
  goalPeriod,
}: {
  entries: BodyEntry[];
  startedAt: string;
  goalPeriod: string;
}) {
  const [tab, setTab] = useState<Tab>("thisWeek");
  const journey = getJourneyProgress({ startedAt, goalPeriod });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">{bodyCopy.header.title}</h1>
          <p className="mt-1 text-[13px] text-text-secondary">{bodyCopy.header.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <HourglassIcon className="h-4 w-4 text-text-primary" />
          <button
            type="button"
            onClick={() => setTab("thisWeek")}
            aria-label={bodyCopy.capture.cta}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
          >
            <PlusIcon className="h-3.5 w-3.5 text-text-primary" />
          </button>
        </div>
      </div>

      <div className="flex gap-5 border-b" style={{ borderColor: "var(--glass-border)" }}>
        {(
          [
            ["thisWeek", bodyCopy.tabs.thisWeek],
            ["compare", bodyCopy.tabs.compare],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="pb-2.5 text-[14px] font-semibold"
            style={{
              color: tab === key ? "var(--color-ink)" : "var(--color-text-muted)",
              borderBottom: tab === key ? "2px solid var(--color-ink)" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "thisWeek" ? (
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-en mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-text-muted">
              {bodyCopy.thisWeek.shapeLabel}
            </p>
            <p className="font-cormorant text-lg font-semibold text-text-primary">
              {bodyCopy.thisWeek.week(journey.currentWeek, journey.totalWeeks)}
            </p>
          </div>

          <BodyCapture entries={entries} />

          <hr style={{ borderColor: "var(--glass-border)" }} />

          <BodyTimeline entries={entries} startedAt={startedAt} goalPeriod={goalPeriod} />
        </div>
      ) : (
        <BodyCompare entries={entries} startedAt={startedAt} goalPeriod={goalPeriod} />
      )}
    </div>
  );
}
