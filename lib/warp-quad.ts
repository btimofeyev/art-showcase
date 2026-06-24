export type Point = {
  x: number;
  y: number;
};

export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function defaultCorners(width: number, height: number): Point[] {
  const insetX = width * 0.08;
  const insetY = height * 0.08;
  return [
    { x: insetX, y: insetY },
    { x: width - insetX, y: insetY },
    { x: width - insetX, y: height - insetY },
    { x: insetX, y: height - insetY },
  ];
}

export function outputDimensions(corners: Point[]) {
  const [tl, tr, br, bl] = corners;
  const width = Math.max(distance(tl, tr), distance(bl, br));
  const height = Math.max(distance(tl, bl), distance(tr, br));
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

type Affine = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

function getAffineTransform(src: Point[], dst: Point[]): Affine {
  const [s0, s1, s2] = src;
  const [d0, d1, d2] = dst;

  const denom =
    (s0.x - s2.x) * (s1.y - s2.y) - (s1.x - s2.x) * (s0.y - s2.y);

  const a =
    ((d0.x - d2.x) * (s1.y - s2.y) - (d1.x - d2.x) * (s0.y - s2.y)) / denom;
  const b =
    ((d0.x - d2.x) * (s2.x - s1.x) - (d1.x - d2.x) * (s0.x - s2.x)) / denom;
  const c =
    ((d0.y - d2.y) * (s1.y - s2.y) - (d1.y - d2.y) * (s0.y - s2.y)) / denom;
  const d =
    ((d0.y - d2.y) * (s2.x - s1.x) - (d1.y - d2.y) * (s0.x - s2.x)) / denom;
  const e =
    (d0.x - a * s0.x - c * s0.y);
  const f =
    (d0.y - b * s0.x - d * s0.y);

  return { a, b, c, d, e, f };
}

function drawImageTriangle(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  src: Point[],
  dst: Point[],
) {
  const transform = getAffineTransform(src, dst);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dst[0].x, dst[0].y);
  ctx.lineTo(dst[1].x, dst[1].y);
  ctx.lineTo(dst[2].x, dst[2].y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(
    transform.a,
    transform.b,
    transform.c,
    transform.d,
    transform.e,
    transform.f,
  );
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

export function warpQuadToCanvas(
  image: HTMLImageElement,
  corners: Point[],
): HTMLCanvasElement {
  const { width, height } = outputDimensions(corners);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const [tl, tr, br, bl] = corners;
  const dst = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  drawImageTriangle(ctx, image, [tl, tr, br], [dst[0], dst[1], dst[2]]);
  drawImageTriangle(ctx, image, [tl, br, bl], [dst[0], dst[2], dst[3]]);

  return canvas;
}

export async function warpQuadToBlob(
  image: HTMLImageElement,
  corners: Point[],
  maxDimension = 2560,
): Promise<Blob> {
  let source = image;
  let scaledCorners = corners;

  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  if (longest > maxDimension) {
    const scale = maxDimension / longest;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    source = await loadImageFromCanvas(canvas);
    scaledCorners = corners.map((point) => ({
      x: point.x * scale,
      y: point.y * scale,
    }));
  }

  const warped = warpQuadToCanvas(source, scaledCorners);
  const blob = await canvasToBlob(warped, "image/jpeg", 0.92);
  if (!blob) throw new Error("Failed to export scanned image");
  return blob;
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    image.src = url;
  });
}

export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return loadImageFromFile(new File([blob], "capture.jpg", { type: blob.type }));
}

function loadImageFromCanvas(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = canvas.toDataURL("image/jpeg", 0.92);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

export function displayScale(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  return {
    width: naturalWidth * ratio,
    height: naturalHeight * ratio,
    ratio,
  };
}

export function toImagePoint(point: Point, ratio: number): Point {
  return { x: point.x / ratio, y: point.y / ratio };
}

export function toDisplayPoint(point: Point, ratio: number): Point {
  return { x: point.x * ratio, y: point.y * ratio };
}
