import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { cn } from "@/lib/utils";

type ArtworkCardProps = {
  artwork: Artwork;
  index?: number;
  className?: string;
  heartCount?: number;
};

function getImageDimensions(artwork: Artwork) {
  const width = artwork.width ?? 800;
  const height = artwork.height ?? 1000;
  return { width, height };
}

export function ArtworkCard({
  artwork,
  index = 0,
  className,
  heartCount = 0,
}: ArtworkCardProps) {
  const { width, height } = getImageDimensions(artwork);

  return (
    <Link
      href={`/art/${artwork.id}`}
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      className={cn(
        "group animate-rise block break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className,
      )}
    >
      <div className="relative overflow-hidden bg-line transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_40px_-12px_rgba(17,17,16,0.18)]">
        <Image
          src={artwork.blob_url}
          alt={artwork.title}
          width={width}
          height={height}
          quality={80}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="label-caps text-white/90">View piece</span>
        </div>
      </div>

      <div className="pt-3">
        <h2 className="font-display text-sm font-bold tracking-tight text-foreground sm:text-base">
          {artwork.title}
        </h2>
        {(artwork.medium || artwork.year) && (
          <p className="mt-1 text-xs text-muted sm:text-sm">
            {[artwork.medium, artwork.year].filter(Boolean).join(" · ")}
          </p>
        )}
        {heartCount > 0 && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-accent">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
              <path d="M9 15.35S2.25 10.88 2.25 6.75A3.56 3.56 0 0 1 9 4.88a3.56 3.56 0 0 1 6.75 1.87c0 4.13-6.75 8.6-6.75 8.6Z" />
            </svg>
            {heartCount}
          </p>
        )}
      </div>
    </Link>
  );
}
