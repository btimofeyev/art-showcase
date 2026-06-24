"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type CameraCaptureProps = {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
};

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 2560 },
            height: { ideal: 2560 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("Camera access is blocked or unavailable on this device.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-black">
        {error ? (
          <div className="flex min-h-64 items-center justify-center p-6 text-center text-sm text-stone-200">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-[3/4] w-full object-cover"
          />
        )}
      </div>

      <p className="text-sm text-stone-600">
        Fill the frame with the artwork. You&apos;ll crop out the background next.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={capturePhoto} disabled={!ready || Boolean(error)}>
          Capture
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
