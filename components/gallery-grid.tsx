import type { Artwork } from "@/lib/types";
import { ArtworkCard } from "./artwork-card";

type GalleryGridProps = {
  artworks: Artwork[];
  heartCounts?: Record<string, number>;
};

export function GalleryGrid({ artworks, heartCounts = {} }: GalleryGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="accent-rule mx-auto" />
          <p className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            Nothing here yet
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            New work lands here once it&apos;s published. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  const [featured, ...rest] = artworks;
  const useFeaturedLayout = artworks.length >= 3;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="label-caps text-muted">Gallery</span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Selected work
          </h2>
        </div>
      </div>

      {useFeaturedLayout ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <ArtworkCard
            artwork={featured}
            featured
            index={0}
            heartCount={heartCounts[featured.id] ?? 0}
            className="col-span-2 row-span-2"
          />
          {rest.map((artwork, index) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              index={index + 1}
              heartCount={heartCounts[artwork.id] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {artworks.map((artwork, index) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              featured={index === 0 && artworks.length === 1}
              index={index}
              heartCount={heartCounts[artwork.id] ?? 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
