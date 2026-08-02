import { createClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";

export async function updateProfile({
  displayName,
  avatarFile,
}: {
  displayName?: string;
  avatarFile?: File;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  let avatarUrl: string | undefined;
  if (avatarFile) {
    const ext = avatarFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type || undefined });
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
    },
  });
  if (error) throw error;
}
