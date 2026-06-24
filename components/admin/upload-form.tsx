"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function UploadForm() {
  const router = useRouter();
  const fileInputId = useId();
  const cameraInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medium, setMedium] = useState("");
  const [year, setYear] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function clearPhoto() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError("");
  }

  function handleFileSelected(selected: File | undefined) {
    if (!selected) return;

    if (!ALLOWED_IMAGE_TYPES.has(selected.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    setError("");
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selected));
    if (!title) setTitle("Untitled artwork");
  }

  async function chooseFromDevice() {
    setError("");

    if ("showOpenFilePicker" in window) {
      try {
        const picker = window.showOpenFilePicker as (options: {
          multiple?: boolean;
          types: Array<{
            description: string;
            accept: Record<string, string[]>;
          }>;
        }) => Promise<FileSystemFileHandle[]>;

        const [handle] = await picker({
          multiple: false,
          types: [
            {
              description: "Images",
              accept: {
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "image/webp": [".webp"],
              },
            },
          ],
        });
        const selected = await handle.getFile();
        handleFileSelected(selected);
        return;
      } catch (pickerError) {
        if (pickerError instanceof DOMException && pickerError.name === "AbortError") {
          return;
        }
      }
    }

    fileInputRef.current?.click();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Take or choose a photo first");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("medium", medium);
    if (year) formData.append("year", year);
    formData.append("published", published ? "true" : "false");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Upload failed");
      setLoading(false);
      return;
    }

    clearPhoto();
    setTitle("");
    setDescription("");
    setMedium("");
    setYear("");
    setPublished(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <div>
        <h2 className="text-base font-medium text-stone-900">Upload artwork</h2>
        <p className="mt-1 text-sm text-stone-600">
          Take a photo with your camera or pick an image from your device.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!file ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              className="min-h-24 flex-col gap-1 py-6"
              onClick={() => cameraInputRef.current?.click()}
            >
              <span>Take photo</span>
              <span className="text-xs font-normal opacity-80">Opens your camera</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="min-h-24 flex-col gap-1 py-6"
              onClick={() => void chooseFromDevice()}
            >
              <span>Choose image</span>
              <span className="text-xs font-normal opacity-80">From gallery or files</span>
            </Button>
          </div>
        ) : (
          <>
            {previewUrl && (
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Artwork preview"
                  className="mx-auto max-h-64 object-contain"
                />
              </div>
            )}

            <Button type="button" variant="ghost" onClick={clearPhoto} disabled={loading}>
              Choose a different image
            </Button>
          </>
        )}

        <p className="text-xs text-stone-500">
          If Google Photos won&apos;t load, use Take photo or pick from Files in the chooser menu.
        </p>

        <input
          ref={cameraInputRef}
          id={cameraInputId}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            handleFileSelected(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept="*/*"
          className="sr-only"
          onChange={(event) => {
            handleFileSelected(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {file && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm text-stone-600">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="medium" className="mb-1.5 block text-sm text-stone-600">
                  Medium
                </label>
                <Input
                  id="medium"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="Oil on canvas"
                />
              </div>
              <div>
                <label htmlFor="year" className="mb-1.5 block text-sm text-stone-600">
                  Year
                </label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                />
              </div>
              <div className="flex items-end">
                <label className="flex min-h-11 items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="size-4 rounded border-stone-300 text-accent focus:ring-accent"
                  />
                  Publish immediately
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm text-stone-600">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about this piece"
              />
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {file && (
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Uploading..." : "Upload to gallery"}
          </Button>
        )}
      </form>
    </div>
  );
}
