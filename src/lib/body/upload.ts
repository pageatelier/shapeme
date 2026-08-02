import { createClient } from "@/lib/supabase/client";
import { BODY_PHOTOS_BUCKET, bodyPhotoPath } from "./storage";
import type { BodyPhotoSlot } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

const slotColumn: Record<BodyPhotoSlot, "front_image" | "side_image" | "back_image"> = {
  front: "front_image",
  side: "side_image",
  back: "back_image",
};

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/")[1] ?? "jpg";
}

/**
 * Uploads one Front/Side/Back photo to the private `body-photos` bucket and
 * upserts the matching column on that day's body_entries row (the other two
 * slot columns are left untouched — Postgres upsert only overwrites columns
 * present in the payload). Runs entirely client-side: Storage and the table
 * write are both protected by the caller's session via RLS, so BodyCapture
 * can call this straight from its file input's onChange.
 */
export async function uploadBodyPhoto({
  date,
  slot,
  file,
}: {
  date: string;
  slot: BodyPhotoSlot;
  file: File;
}): Promise<{ path: string; signedUrl: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const ext = extensionFor(file);
  const path = bodyPhotoPath(user.id, date, slot, ext);

  const { error: uploadError } = await supabase.storage
    .from(BODY_PHOTOS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (uploadError) throw uploadError;

  const { error: upsertError } = await supabase
    .from("body_entries")
    .upsert({ user_id: user.id, date, [slotColumn[slot]]: path }, { onConflict: "user_id,date" });
  if (upsertError) throw upsertError;

  const { data: signed } = await supabase.storage
    .from(BODY_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  return { path, signedUrl: signed?.signedUrl ?? null };
}
