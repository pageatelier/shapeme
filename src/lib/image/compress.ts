const DEFAULT_MAX_DIMENSION = 1200;
const DEFAULT_JPEG_QUALITY = 0.78;

/**
 * Resizes + re-encodes an image file entirely client-side before upload —
 * long edge capped at `maxDimension` (default 1200px), JPEG @ `quality`
 * (default 0.78), targeting ~300-500KB at the defaults. Callers that need
 * to preserve more detail — body progress photos, where the point is
 * comparing physique across weeks — can raise both; thumbnails (meal,
 * avatar) are fine at the defaults.
 * createImageBitmap's `imageOrientation: "from-image"` bakes in EXIF
 * rotation (iPhone photos are frequently stored "sideways" with an EXIF
 * flag), so the output is always right-side-up without extra libraries.
 * Falls back to the original file untouched if anything goes wrong (e.g.
 * an unsupported format, or a non-browser environment) rather than
 * blocking the upload.
 */
export async function compressImage(
  file: File,
  { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_JPEG_QUALITY }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;

    const compressed = new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });

    console.log(
      `[image] compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB -> ` +
        `${(compressed.size / 1024).toFixed(0)}KB (${width}x${height})`,
    );

    return compressed;
  } catch (err) {
    console.error("[image] compression failed, uploading original file:", err);
    return file;
  }
}
