import Link from "next/link";
import { BodyThumb } from "@/components/body/BodyThumb";
import type { BodyEntry } from "@/lib/body/types";
import { challengeDayNumber, isMilestoneDay } from "@/lib/challenge/date";

function monthLabel(date: string) {
  const [, m] = date.split("-");
  return `${Number(m)}월`;
}

export function BodyTimeline({ entries, challengeStartDate }: { entries: BodyEntry[]; challengeStartDate?: string }) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const groups = new Map<string, BodyEntry[]>();
  for (const entry of sorted) {
    const key = monthLabel(entry.date);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(key, [entry]);
    }
  }

  if (sorted.length === 0) {
    return (
      <section>
        <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">타임라인</p>
        <div className="surface-card p-5 text-center text-[13px] text-text-muted">
          아직 눈바디 기록이 없어요. 위에서 사진을 촬영해 첫 기록을 남겨보세요.
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="mb-3 text-[17px] font-bold tracking-[-0.025em] text-text-primary">타임라인</p>
      <div className="flex flex-col gap-5">
        {[...groups.entries()].map(([month, monthEntries]) => (
          <div key={month}>
            <p className="font-en mb-2 text-[11px] font-semibold tracking-[0.1em] text-text-muted lowercase">
              {month}
            </p>
            <div className="flex flex-col gap-3">
              {monthEntries.map((entry) => (
                <Link
                  key={entry.date}
                  href={`/body/${entry.date}`}
                  className="surface-card flex items-center justify-between p-4"
                >
                  <div><span className="text-[13px] font-bold text-text-primary">{entry.dateLabel}</span>{challengeStartDate && (() => { const day = challengeDayNumber(challengeStartDate, entry.date); return day > 0 && day <= 100 ? <p className="font-en mt-0.5 text-[10px] font-semibold tracking-[0.08em] text-pink-500 uppercase">Day {day}{isMilestoneDay(day) ? " · milestone" : ""}</p> : null; })()}</div>
                  <div className="flex gap-3">
                    <BodyThumb slot="front" filled={entry.front} imageUrl={entry.frontImageUrl} size={40} showLabel={false} />
                    <BodyThumb slot="side" filled={entry.side} imageUrl={entry.sideImageUrl} size={40} showLabel={false} />
                    <BodyThumb slot="back" filled={entry.back} imageUrl={entry.backImageUrl} size={40} showLabel={false} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
