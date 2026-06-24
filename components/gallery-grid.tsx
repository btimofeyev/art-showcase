import type { Artwork } from "@/lib/types";
import { ArtworkCard } from "./artwork-card";

type GalleryGridProps = {
  artworks: Artwork[];
  heartCounts?: Record<string, number>;
  artistName?: string;
};

export function GalleryGrid({
  artworks,
  heartCounts = {},
  artistName = "Magdalena",
}: GalleryGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="accent-rule mx-auto" />
          <p className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            {artistName}&apos;s gallery is just getting started
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            New pieces will show up here soon. Come back to see what she&apos;s
            been working on.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="label-caps text-muted">Gallery</span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {artistName}&apos;s work
          </h2>
        </div>
      </div>

      <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [column-gap:0.75rem] sm:[column-gap:1rem]">
        {artworks.map((artwork, index) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            index={index}
            heartCount={heartCounts[artwork.id] ?? 0}
            className="mb-3 sm:mb-4"
          />
        ))}
      </div>
    </section>
  );
}
