import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { MealCard } from "@/components/meal/MealCard";
import { todayIsoDate } from "@/lib/body/date";
import { getMealLogsSafe } from "@/lib/meal/queries";
import { MEAL_TYPES } from "@/lib/meal/types";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MealPage() {
  const user = await getCurrentUser();

  const date = todayIsoDate();
  const meals = user
    ? await getMealLogsSafe(user.id, date)
    : MEAL_TYPES.map((type) => ({ type, date, filled: false }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">오늘의 식단</h1>
      </div>

      <p className="text-[13px] leading-relaxed text-text-secondary">
        음식을 좋음과 나쁨으로 판단하지 않고, 식사 후 몸의 상태를 가볍게 관찰해요.
      </p>

      <div className="flex flex-col gap-3">
        {meals.map((meal) => (
          <MealCard key={meal.type} meal={meal} />
        ))}
      </div>
    </div>
  );
}
