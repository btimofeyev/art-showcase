"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Artwork } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ArtworkListProps = {
  artworks: Artwork[];
};

export function ArtworkList({ artworks: initialArtworks }: ArtworkListProps) {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    medium: "",
    year: "",
    published: true,
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function startEdit(artwork: Artwork) {
    setEditingId(artwork.id);
    setForm({
      title: artwork.title,
      description: artwork.description ?? "",
      medium: artwork.medium ?? "",
      year: artwork.year?.toString() ?? "",
      published: artwork.published,
    });
  }

  async function saveEdit(id: string) {
    setLoadingId(id);
    const response = await fetch(`/api/artworks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        medium: form.medium || null,
        year: form.year ? Number(form.year) : null,
        published: form.published,
      }),
    });

    if (response.ok) {
      const updated = await response.json();
      setArtworks((items) =>
        items.map((item) => (item.id === id ? updated : item)),
      );
      setEditingId(null);
      router.refresh();
    }
    setLoadingId(null);
  }

  async function move(id: string, direction: "up" | "down") {
    setLoadingId(id);
    const response = await fetch(`/api/artworks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });

    if (response.ok) {
      const updated = await response.json();
      setArtworks(updated);
      router.refresh();
    }
    setLoadingId(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this artwork? This cannot be undone.")) return;

    setLoadingId(id);
    const response = await fetch(`/api/artworks/${id}`, { method: "DELETE" });

    if (response.ok) {
      setArtworks((items) => items.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
      router.refresh();
    }
    setLoadingId(null);
  }

  if (artworks.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm text-stone-600">No artworks uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-medium text-stone-900">Manage artworks</h2>
      {artworks.map((artwork, index) => (
        <article
          key={artwork.id}
          className="rounded-xl border border-stone-200 bg-white p-4"
        >
          <div className="flex gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <Image
                src={artwork.blob_url}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="min-w-0 flex-1">
              {editingId === artwork.id ? (
                <div className="space-y-3">
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={form.medium}
                      onChange={(e) => setForm({ ...form, medium: e.target.value })}
                      placeholder="Medium"
                    />
                    <Input
                      type="number"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      placeholder="Year"
                    />
                  </div>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Description"
                  />
                  <label className="flex items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) =>
                        setForm({ ...form, published: e.target.checked })
                      }
                      className="size-4 rounded border-stone-300 text-accent"
                    />
                    Published
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => saveEdit(artwork.id)}
                      disabled={loadingId === artwork.id}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-stone-900">{artwork.title}</h3>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {[artwork.medium, artwork.year].filter(Boolean).join(" · ")}
                        {artwork.published ? "" : " · Draft"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => startEdit(artwork)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={index === 0 || loadingId === artwork.id}
                      onClick={() => move(artwork.id, "up")}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={
                        index === artworks.length - 1 || loadingId === artwork.id
                      }
                      onClick={() => move(artwork.id, "down")}
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      disabled={loadingId === artwork.id}
                      onClick={() => remove(artwork.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
