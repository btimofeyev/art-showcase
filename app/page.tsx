import { GalleryGrid } from "@/components/gallery-grid";
import { GalleryHero } from "@/components/gallery-hero";
import { getPublishedArtworks, getSiteSettings } from "@/lib/db";
import { getHeartCountsForArtworks } from "@/lib/feedback";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, artworks] = await Promise.all([
    getSiteSettings(),
    getPublishedArtworks(),
  ]);

  const heartCounts = await getHeartCountsForArtworks(
    artworks.map((artwork) => artwork.id),
  );

  return (
    <div className="min-h-full">
      <GalleryHero settings={settings} artworkCount={artworks.length} />
      <GalleryGrid
        artworks={artworks}
        heartCounts={heartCounts}
        artistName={settings.artist_name}
      />
      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="label-caps text-muted">
            {settings.artist_name} · shared with family &amp; friends
          </p>
        </div>
      </footer>
    </div>
  );
}
