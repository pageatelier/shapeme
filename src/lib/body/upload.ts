import { compressImage } from "@/lib/image/compress";
import { createClient } from "@/lib/supabase/client";
import { BODY_PHOTOS_BUCKET, bodyPhotoPath } from "./storage";
import type { BodyPhotoSlot } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

const slotColumn: Record<BodyPhotoSlot, "front_image" | "side_image" | "back_image" | "full_body_image"> = {
  front: "front_image",
  side: "side_image",
  back: "back_image",
  full: "full_body_image",
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
  if (!user) throw new Error("You must be signed in.");

  // Body photos exist specifically to compare physique across weeks, so
  // they keep more detail than the shared default (meal/avatar thumbnails
  // don't need it).
  const compressed = await compressImage(file, { maxDimension: 2400, quality: 0.9 });
  const ext = extensionFor(compressed);
  const path = bodyPhotoPath(user.id, date, slot, ext);

  const { error: uploadError } = await supabase.storage
    .from(BODY_PHOTOS_BUCKET)
    .upload(path, compressed, {
      upsert: true,
      contentType: compressed.type || undefined,
      cacheControl: "31536000",
    });
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

/**
 * Deletes one slot's photo — the Storage object and the column reference on
 * that day's body_entries row. The row itself is never deleted, just that
 * one column nulled out, so the other two slots (and the memo) survive.
 * Looks up the current path itself (the client only ever holds a short-lived
 * signed URL, not the raw storage path) so callers don't need to track it.
 */
export async function deleteBodyPhoto({
  date,
  slot,
}: {
  date: string;
  slot: BodyPhotoSlot;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const column = slotColumn[slot];
  const { data: row, error: fetchError } = await supabase
    .from("body_entries")
    .select(column)
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const path = (row as Record<string, string | null> | null)?.[column] ?? null;
  if (path) {
    const { error: removeError } = await supabase.storage.from(BODY_PHOTOS_BUCKET).remove([path]);
    if (removeError) throw removeError;
  }

  const { error: updateError } = await supabase
    .from("body_entries")
    .update({ [column]: null })
    .eq("user_id", user.id)
    .eq("date", date);
  if (updateError) throw updateError;
}
