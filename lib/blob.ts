import { del, put } from "@vercel/blob";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_TYPES.has(type);
}

export async function uploadArtworkImage(
  buffer: Buffer,
  filename: string,
  contentType: string,
) {
  const safeName = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
  const pathname = `artworks/${Date.now()}-${safeName}.webp`;

  const blob = await put(pathname, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType,
  });

  return blob;
}

export async function deleteArtworkImage(url: string) {
  await del(url);
}
