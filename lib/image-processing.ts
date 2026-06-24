import sharp from "sharp";

const MAX_DIMENSION = 2560;
const WEBP_QUALITY = 88;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: "image/webp";
  extension: "webp";
  originalBytes: number;
  outputBytes: number;
};

export function getMaxInputBytes() {
  return MAX_INPUT_BYTES;
}

export async function processArtworkImage(input: Buffer): Promise<ProcessedImage> {
  if (input.byteLength > MAX_INPUT_BYTES) {
    throw new Error("Image exceeds 25MB limit");
  }

  const metadata = await sharp(input, { failOn: "none" }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  let pipeline = sharp(input, { failOn: "none" }).rotate();

  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const buffer = await pipeline
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      smartSubsample: true,
    })
    .toBuffer();

  const outputMeta = await sharp(buffer).metadata();

  if (!outputMeta.width || !outputMeta.height) {
    throw new Error("Failed to process image");
  }

  return {
    buffer,
    width: outputMeta.width,
    height: outputMeta.height,
    contentType: "image/webp",
    extension: "webp",
    originalBytes: input.byteLength,
    outputBytes: buffer.byteLength,
  };
}
