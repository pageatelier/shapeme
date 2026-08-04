import { compressImage } from "@/lib/image/compress";
import { createClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";

export async function updateProfile({
  displayName,
  avatarFile,
  bio,
  heightCm,
  weightKg,
  language,
  country,
  timezone,
  monthlyGoal,
}: {
  displayName?: string;
  avatarFile?: File;
  bio?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  language?: string;
  country?: string;
  timezone?: string;
  monthlyGoal?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  let avatarUrl: string | undefined;
  if (avatarFile) {
    const compressed = await compressImage(avatarFile);
    const ext = compressed.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, compressed, {
        upsert: true,
        contentType: compressed.type || undefined,
        cacheControl: "31536000",
      });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    // Cache-bust: the path is stable across re-uploads, so append a
    // timestamp or the browser (and other users' cached copies) may keep
    // showing the old image.
    avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      ...(displayName !== undefined && { display_name: displayName }),
      ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
      ...(bio !== undefined && { bio }),
      ...(heightCm !== undefined && { height_cm: heightCm }),
      ...(weightKg !== undefined && { weight_kg: weightKg }),
      ...(language !== undefined && { language }),
      ...(country !== undefined && { country }),
      ...(timezone !== undefined && { timezone }),
      ...(monthlyGoal !== undefined && { monthly_goal: monthlyGoal }),
    },
  });
  if (error) throw error;
}
