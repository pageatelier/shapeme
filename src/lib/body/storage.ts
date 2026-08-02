import type { BodyPhotoSlot } from "./types";

export const BODY_PHOTOS_BUCKET = "body-photos";

/**
 * Storage object path for one slot's photo. Shared by the browser upload
 * helper and the server queries so both agree on the same layout. Each
 * upload gets a unique path (timestamp suffix) rather than overwriting the
 * same one, so uploaded photos can be cached aggressively/indefinitely —
 * a stable path would mean a long cache-control header serves a stale
 * image after the user replaces that day's photo.
 */
export function bodyPhotoPath(
  userId: string,
  date: string,
  slot: BodyPhotoSlot,
  ext: string,
) {
  return `${userId}/${date}/${slot}-${Date.now()}.${ext}`;
}
