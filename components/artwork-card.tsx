import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { cn } from "@/lib/utils";

type ArtworkCardProps = {
  artwork: Artwork;
  featured?: boolean;
  index?: number;
  className?: string;
  heartCount?: number;
};

export function ArtworkCard({
  artwork,
  featured = false,
  index = 0,
  className,
  heartCount = 0,
}: ArtworkCardProps) {
  return (
    <Link
      href={`/art/${artwork.id}`}
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      className={cn(
        "group animate-rise block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-line transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_40px_-12px_rgba(17,17,16,0.18)]",
          featured ? "aspect-[4/5] sm:aspect-auto sm:min-h-[28rem]" : "aspect-[4/5]",
        )}
      >
        <Image
          src={artwork.blob_url}
          alt={artwork.title}
          fill
          quality={featured ? 85 : 80}
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="label-caps text-white/90">View piece</span>
        </div>
      </div>

      <div className={cn("pt-3", featured && "sm:pt-4")}>
        <h2
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            featured ? "text-lg sm:text-xl" : "text-sm sm:text-base",
          )}
        >
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
