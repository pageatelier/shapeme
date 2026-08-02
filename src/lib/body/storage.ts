import type { BodyPhotoSlot } from "./types";

export const BODY_PHOTOS_BUCKET = "body-photos";

/** Storage object path for one slot's photo. Shared by the browser upload helper and the server queries so both agree on the same layout. */
export function bodyPhotoPath(
  userId: string,
  date: string,
  slot: BodyPhotoSlot,
  ext: string,
) {
  return `${userId}/${date}/${slot}.${ext}`;
}
