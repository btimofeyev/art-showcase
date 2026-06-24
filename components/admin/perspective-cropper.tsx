"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  defaultCorners,
  displayScale,
  toDisplayPoint,
  toImagePoint,
  warpQuadToBlob,
  type Point,
} from "@/lib/warp-quad";

type PerspectiveCropperProps = {
  image: HTMLImageElement;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
};

const HANDLE_RADIUS = 18;

export function PerspectiveCropper({
  image,
  onConfirm,
  onCancel,
}: PerspectiveCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [corners, setCorners] = useState<Point[]>(() =>
    defaultCorners(image.naturalWidth, image.naturalHeight),
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const layout = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) {
      return { width: 0, height: 0, ratio: 1 };
    }
    return displayScale(
      image.naturalWidth,
      image.naturalHeight,
      containerSize.width,
      containerSize.height,
    );
  }, [containerSize, image.naturalWidth, image.naturalHeight]);

  const displayCorners = useMemo(
    () => corners.map((corner) => toDisplayPoint(corner, layout.ratio)),
    [corners, layout.ratio],
  );

  const updatePreview = useCallback(async () => {
    try {
      const blob = await warpQuadToBlob(image, corners);
      const url = URL.createObjectURL(blob);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
    } catch {
      setPreviewUrl(null);
    }
  }, [corners, image]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void updatePreview();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [updatePreview]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePointerDown(index: number, event: React.PointerEvent) {
    event.preventDefault();
    setDragIndex(index);
  }

  useEffect(() => {
    if (dragIndex === null) return;

    function onMove(event: PointerEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || layout.width === 0) return;

      const offsetX = (rect.width - layout.width) / 2;
      const offsetY = (rect.height - layout.height) / 2;
      const displayPoint = {
        x: event.clientX - rect.left - offsetX,
        y: event.clientY - rect.top - offsetY,
      };
      const clamped = {
        x: Math.min(Math.max(displayPoint.x, 0), layout.width),
        y: Math.min(Math.max(displayPoint.y, 0), layout.height),
      };
      const imagePoint = toImagePoint(clamped, layout.ratio);

      setCorners((current) =>
        current.map((corner, index) =>
          index === dragIndex ? imagePoint : corner,
        ),
      );
    }

    function onUp() {
      setDragIndex(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragIndex, layout.width, layout.height, layout.ratio]);

  async function handleConfirm() {
    setProcessing(true);
    try {
      const blob = await warpQuadToBlob(image, corners);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  }

  const quadPath = displayCorners
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-stone-900">Align the corners</h3>
        <p className="mt-1 text-sm text-stone-600">
          Drag each corner to the edges of the artwork, like a document scan.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div
          ref={containerRef}
          className="relative min-h-72 rounded-lg border border-stone-200 bg-stone-100"
        >
          {layout.width > 0 && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: layout.width, height: layout.height }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt="Scan source"
                className="block h-full w-full object-contain"
                draggable={false}
              />
              <svg
                className="absolute inset-0 touch-none"
                width={layout.width}
                height={layout.height}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
              >
                <path
                  d={`${quadPath} Z`}
                  fill="rgba(224, 79, 61, 0.12)"
                  stroke="#e04f3d"
                  strokeWidth="2"
                />
                {displayCorners.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={HANDLE_RADIUS}
                    fill="#faf9f6"
                    stroke="#e04f3d"
                    strokeWidth="2"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(event) => handlePointerDown(index, event)}
                  />
                ))}
              </svg>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Preview
          </p>
          <div className="flex min-h-64 items-center justify-center bg-white">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Scanned preview"
                className="max-h-80 w-full object-contain"
              />
            ) : (
              <p className="text-sm text-stone-500">Adjust corners to preview</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleConfirm} disabled={processing}>
          {processing ? "Processing..." : "Use scanned image"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
}
