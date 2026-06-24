"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SettingsFormProps = {
  settings: SiteSettings;
};

export function SettingsForm({ settings: initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (response.ok) {
      const updated = await response.json();
      setSettings(updated);
      setMessage("Saved");
      router.refresh();
    } else {
      setMessage("Failed to save");
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
    >
      <h2 className="text-base font-medium text-stone-900">Site settings</h2>

      <div>
        <label htmlFor="artist_name" className="mb-1.5 block text-sm text-stone-600">
          Artist name
        </label>
        <Input
          id="artist_name"
          value={settings.artist_name}
          onChange={(e) =>
            setSettings({ ...settings, artist_name: e.target.value })
          }
          required
        />
      </div>

      <div>
        <label htmlFor="tagline" className="mb-1.5 block text-sm text-stone-600">
          Tagline
        </label>
        <Input
          id="tagline"
          value={settings.tagline ?? ""}
          onChange={(e) =>
            setSettings({ ...settings, tagline: e.target.value || null })
          }
          placeholder="Original art — sketches, paintings, and more"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm text-stone-600">
          Bio
        </label>
        <Textarea
          id="bio"
          value={settings.bio ?? ""}
          onChange={(e) =>
            setSettings({ ...settings, bio: e.target.value || null })
          }
          placeholder="A short note for family and friends visiting your gallery"
        />
      </div>

      {message && <p className="text-sm text-stone-600">{message}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
