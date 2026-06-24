"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medium, setMedium] = useState("");
  const [year, setYear] = useState("");
  const [published, setPublished] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose an image to upload");
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

    setFile(null);
    setTitle("");
    setDescription("");
    setMedium("");
    setYear("");
    setPublished(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <h2 className="text-base font-medium text-stone-900">Upload artwork</h2>

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
          handleFile(dropped ?? null);
        }}
        className={`rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-stone-300"
        }`}
      >
        <input
          id="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
        <label htmlFor="file" className="cursor-pointer">
          <p className="text-sm text-stone-700">
            {file ? file.name : "Drop an image here or tap to browse"}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            JPEG, PNG, or WebP · optimized to WebP on upload
          </p>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm text-stone-600">
            Title
          </label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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

      <Button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
