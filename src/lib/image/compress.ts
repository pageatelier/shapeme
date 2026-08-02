const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.78;

/**
 * Resizes + re-encodes an image file entirely client-side before upload —
 * long edge capped at 1200px, JPEG @ 0.78 quality, targeting ~300-500KB.
 * createImageBitmap's `imageOrientation: "from-image"` bakes in EXIF
 * rotation (iPhone photos are frequently stored "sideways" with an EXIF
 * flag), so the output is always right-side-up without extra libraries.
 * Falls back to the original file untouched if anything goes wrong (e.g.
 * an unsupported format, or a non-browser environment) rather than
 * blocking the upload.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
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
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
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
