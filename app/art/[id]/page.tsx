import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArtworkFeedbackPanel } from "@/components/artwork-feedback";
import { getPublishedArtworkById, getSiteSettings } from "@/lib/db";
import { getArtworkFeedback } from "@/lib/feedback";
import { getVisitorKey } from "@/lib/visitor";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [artwork, settings] = await Promise.all([
    getPublishedArtworkById(id),
    getSiteSettings(),
  ]);

  if (!artwork) {
    return { title: "Artwork not found" };
  }

  const description =
    artwork.description ||
    [artwork.medium, artwork.year].filter(Boolean).join(" · ") ||
    `Artwork by ${settings.artist_name}`;

  return {
    title: artwork.title,
    description,
    openGraph: {
      title: artwork.title,
      description,
      images: [{ url: artwork.blob_url, alt: artwork.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: artwork.title,
      description,
      images: [artwork.blob_url],
    },
  };
}

export default async function ArtworkPage({ params }: PageProps) {
  const { id } = await params;
  const [artwork, settings, visitorKey] = await Promise.all([
    getPublishedArtworkById(id),
    getSiteSettings(),
    getVisitorKey(),
  ]);

  if (!artwork) {
    notFound();
  }

  const feedback = await getArtworkFeedback(id, visitorKey);

  return (
    <div className="min-h-full animate-fade-in">
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Link>
          <span className="label-caps hidden text-muted sm:inline">
            {settings.artist_name}
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-12">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-line sm:aspect-[4/5] lg:aspect-auto lg:min-h-[34rem]">
            <Image
              src={artwork.blob_url}
              alt={artwork.title}
              fill
              priority
              quality={90}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
            />
          </div>

          <div className="lg:sticky lg:top-24">
            <span className="label-caps text-accent">Artwork</span>
            <div className="accent-rule mt-3" />
            <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[0.98] tracking-tighter text-foreground">
              {artwork.title}
            </h1>
            {(artwork.medium || artwork.year) && (
              <p className="mt-4 text-sm font-medium text-muted sm:text-base">
                {[artwork.medium, artwork.year].filter(Boolean).join(" · ")}
              </p>
            )}
            {artwork.description && (
              <p className="mt-6 text-base leading-relaxed text-muted">
                {artwork.description}
              </p>
            )}
            <Link
              href="/"
              className="mt-8 inline-flex min-h-11 items-center justify-center border border-line bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              See more work
            </Link>
          </div>
        </div>

        <ArtworkFeedbackPanel
          artworkId={artwork.id}
          artistName={settings.artist_name}
          initialFeedback={feedback}
        />
      </article>
    </div>
  );
}
