export type MealType = "morning" | "lunch" | "dinner" | "snack";

export const MEAL_TYPES: MealType[] = ["morning", "lunch", "dinner", "snack"];

export const MEAL_TITLES: Record<MealType, string> = {
  morning: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const FULLNESS_OPTIONS = ["부족함", "적당함", "배부름", "과식함"] as const;
export type Fullness = (typeof FULLNESS_OPTIONS)[number];

export type MealLog = {
  type: MealType;
  date: string;
  filled: boolean;
  imageUrl?: string;
  description?: string;
  fullness?: Fullness;
  mood?: string;
  memo?: string;
};
