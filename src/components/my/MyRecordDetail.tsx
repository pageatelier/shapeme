import Image from "next/image";
import { weekdayIndex } from "@/lib/body/date";
import { MEAL_TITLES } from "@/lib/meal/types";
import { ACTIVITY_CONFIG } from "@/lib/movement/types";
import type { RecordDetail } from "@/lib/records/types";
import { WEEKDAYS } from "@/lib/workout/types";
import { CameraIcon, MealIcon, MoveIcon, WaterDropIcon } from "@/components/icons";

function dateHeaderLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일 ${WEEKDAYS[weekdayIndex(isoDate)]}요일`;
}

const CATEGORY_CHIPS = [
  { key: "body", label: "Body" },
  { key: "move", label: "Move" },
  { key: "meals", label: "식단" },
  { key: "water", label: "물" },
] as const;

export function MyRecordDetail({ detail, todayIso }: { detail: RecordDetail; todayIso: string }) {
  const routineLabel = detail.isoDate === todayIso ? "오늘의 루틴" : "이날의 루틴";
  const presentKeys = new Set<string>();
  if (detail.body) presentKeys.add("body");
  if (detail.move) presentKeys.add("move");
  if (detail.meals.length > 0) presentKeys.add("meals");
  if (detail.water) presentKeys.add("water");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">
          {dateHeaderLabel(detail.isoDate)}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-en text-xl font-semibold tracking-[-0.03em] text-text-primary">
            {routineLabel} {detail.routinePercent}%
          </span>
        </div>
        {presentKeys.size > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CATEGORY_CHIPS.filter((c) => presentKeys.has(c.key)).map((c) => (
              <span
                key={c.key}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: "var(--color-pink-100)", color: "var(--color-text-secondary)" }}
              >
                {c.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {!detail.hasAnyRecord ? (
        <div className="surface-card p-6 text-center">
          <p className="text-[13px] leading-relaxed text-text-secondary">
            이 날은 기록이 없어요.
            <br />
            작은 순간부터 천천히 남겨보세요. 🌷
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {detail.body && (
            <section className="glass-card p-4">
              <SectionTitle icon={<CameraIcon className="h-3.5 w-3.5" />} label="Body" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    ["정면", detail.body.frontImageUrl],
                    ["측면", detail.body.sideImageUrl],
                    ["후면", detail.body.backImageUrl],
                  ] as const
                ).map(([label, url]) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <div
                      className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-md)]"
                      style={{ background: "var(--color-bg-warm)" }}
                    >
                      {url && (
                        <Image
                          src={url}
                          alt={`${label} 사진`}
                          fill
                          sizes="(max-width: 480px) 30vw, 140px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-text-muted">{label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {detail.move && (
            <section className="glass-card p-4">
              <SectionTitle icon={<MoveIcon className="h-3.5 w-3.5" />} label="Move" />
              <div className="mt-3 flex flex-col gap-2">
                {detail.move.totalSets > 0 && (
                  <p className="text-[13px] text-text-secondary">
                    {detail.move.routineName && (
                      <span className="font-semibold text-text-primary">{detail.move.routineName} · </span>
                    )}
                    {detail.move.doneSets}/{detail.move.totalSets}세트 완료
                  </p>
                )}
                {detail.move.movementLogs.map((log) => {
                  const config = ACTIVITY_CONFIG[log.activityType];
                  return (
                    <p key={log.id} className="text-[13px] text-text-secondary">
                      {config.emoji} {config.label} {log.durationMinutes}분
                      {log.distanceKm != null ? ` · ${log.distanceKm}km` : ""}
                      {log.steps != null ? ` · ${log.steps}보` : ""}
                    </p>
                  );
                })}
              </div>
            </section>
          )}

          {detail.meals.length > 0 && (
            <section className="glass-card p-4">
              <SectionTitle icon={<MealIcon className="h-3.5 w-3.5" />} label="식단" />
              <div className="mt-3 flex flex-col gap-3">
                {detail.meals.map((meal) => (
                  <div key={meal.type} className="flex gap-3">
                    <div
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-md)]"
                      style={{ background: "var(--color-bg-warm)" }}
                    >
                      {meal.imageUrl && (
                        <Image src={meal.imageUrl} alt={`${MEAL_TITLES[meal.type]} 사진`} fill sizes="56px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col justify-center">
                      <p className="text-[13px] font-semibold text-text-primary">{MEAL_TITLES[meal.type]}</p>
                      {meal.memo && <p className="truncate text-[12px] text-text-secondary">{meal.memo}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {detail.water && (
            <section className="glass-card p-4">
              <SectionTitle icon={<WaterDropIcon className="h-3.5 w-3.5" />} label="물" />
              <p className="mt-2 text-[13px] text-text-secondary">
                <span className="font-en font-semibold text-text-primary">{detail.water.totalMl.toLocaleString()}</span>
                {" / "}
                {detail.water.goalMl.toLocaleString()}ml · 달성률 {detail.water.pct}%
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[13px] font-bold text-text-primary">
      {icon}
      {label}
    </p>
  );
}
