"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CameraCapture } from "@/components/admin/camera-capture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Step = "choose" | "camera" | "details";

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("choose");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medium, setMedium] = useState("");
  const [year, setYear] = useState("");
  const [published, setPublished] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetFlow() {
    setStep("choose");
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError("");
  }

  function proceedToDetails(input: Blob | File) {
    const uploadFile =
      input instanceof File
        ? input
        : new File([input], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });

    setFile(uploadFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(uploadFile));
    if (!title) setTitle("Untitled artwork");
    setStep("details");
  }

  function handleFileSelected(selected: File) {
    setError("");
    proceedToDetails(selected);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Capture or choose an image first");
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

    resetFlow();
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
          Capture artwork with your camera or choose a photo from your library.
        </p>
      </div>

      {step === "choose" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={() => setStep("camera")}>
              Scan with camera
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => libraryInputRef.current?.click()}
            >
              Choose photo
            </Button>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const dropped = event.dataTransfer.files[0];
              if (dropped) handleFileSelected(dropped);
            }}
            className={`hidden rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors sm:block ${
              dragging ? "border-accent bg-accent/5" : "border-stone-300"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) handleFileSelected(selected);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-stone-700"
            >
              Or drop an image here
            </button>
          </div>

          <input
            ref={libraryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) handleFileSelected(selected);
              event.target.value = "";
            }}
          />
        </>
      )}

      {step === "camera" && (
        <CameraCapture
          onCapture={(blob) => proceedToDetails(blob)}
          onCancel={() => setStep("choose")}
        />
      )}

      {step === "details" && (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetFlow}>
              Start over
            </Button>
          </div>
        </form>
      )}

      {step === "choose" && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
