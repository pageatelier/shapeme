import { compressImage } from "@/lib/image/compress";
import { createClient } from "@/lib/supabase/client";
import type { Fullness, MealType } from "./types";

const BUCKET = "meal-photos";

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/")[1] ?? "jpg";
}

export async function uploadMealPhoto({
  date,
  mealType,
  file,
}: {
  date: string;
  mealType: MealType;
  file: File;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const compressed = await compressImage(file);
  const ext = extensionFor(compressed);
  // Unique per upload (like body photos) so a long cache-control is safe.
  const path = `${user.id}/${date}/${mealType}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      upsert: true,
      contentType: compressed.type || undefined,
      cacheControl: "31536000",
    });
  if (uploadError) throw uploadError;

  const { error } = await supabase
    .from("meal_logs")
    .upsert(
      { user_id: user.id, meal_type: mealType, meal_date: date, image_path: path },
      { onConflict: "user_id,meal_type,meal_date" },
    );
  if (error) throw error;
}

export async function updateMealFullness({
  date,
  mealType,
  fullness,
}: {
  date: string;
  mealType: MealType;
  fullness: Fullness;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { error } = await supabase
    .from("meal_logs")
    .upsert(
      { user_id: user.id, meal_type: mealType, meal_date: date, fullness },
      { onConflict: "user_id,meal_type,meal_date" },
    );
  if (error) throw error;
}
