"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArtworkList } from "@/components/admin/artwork-list";
import { AdminCommentsPanel } from "@/components/admin/comments-panel";
import { SettingsForm } from "@/components/admin/settings-form";
import { UploadForm } from "@/components/admin/upload-form";
import { Button } from "@/components/ui/button";
import type { Artwork, SiteSettings } from "@/lib/types";

type AdminComment = {
  id: string;
  artwork_id: string;
  author_name: string;
  body: string;
  created_at: string;
  artwork_title: string;
};

type AdminDashboardProps = {
  artworks: Artwork[];
  settings: SiteSettings;
  comments: AdminComment[];
};

export function AdminDashboard({ artworks, settings, comments }: AdminDashboardProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-serif text-2xl text-stone-900">Admin</h1>
            <p className="text-sm text-stone-600">Manage your gallery</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="min-h-11 inline-flex items-center text-sm text-accent">
              View site
            </Link>
            <Button type="button" variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6 pb-16 sm:px-6 sm:py-8">
        <UploadForm />
        <ArtworkList artworks={artworks} />
        <AdminCommentsPanel comments={comments} />
        <SettingsForm settings={settings} />
      </main>
    </div>
  );
}
