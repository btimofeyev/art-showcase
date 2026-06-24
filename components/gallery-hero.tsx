"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/types";

type GalleryHeroProps = {
  settings: SiteSettings;
  artworkCount: number;
};

export function GalleryHero({ settings, artworkCount }: GalleryHeroProps) {
  const [bioOpen, setBioOpen] = useState(false);
  const hasBio = Boolean(settings.bio);

  return (
    <header className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-accent/10 blur-3xl sm:size-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-8 size-48 rounded-full bg-accent-soft blur-2xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="label-caps text-muted">{settings.artist_name}&apos;s studio</span>
          {artworkCount > 0 && (
            <>
              <span className="text-line" aria-hidden>
                /
              </span>
              <span className="label-caps text-accent">
                {artworkCount} {artworkCount === 1 ? "piece" : "pieces"}
              </span>
            </>
          )}
        </div>

        <div className="mt-5 max-w-3xl">
          <div className="accent-rule" />
          <h1 className="mt-4 font-display text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[0.95] tracking-tighter text-foreground">
            {settings.artist_name}
          </h1>
          {settings.tagline && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {settings.tagline}
            </p>
          )}
        </div>

        {hasBio && (
          <div className="mt-6 max-w-2xl">
            <button
              type="button"
              onClick={() => setBioOpen((open) => !open)}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent sm:hidden"
              aria-expanded={bioOpen}
            >
              {bioOpen ? "Hide about" : `About ${settings.artist_name}`}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`transition-transform ${bioOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path
                  d="M3 5.5L7 9.5L11 5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <p
              className={`text-sm leading-relaxed text-muted sm:text-base ${
                bioOpen ? "mt-3 block" : "hidden sm:mt-3 sm:block"
              }`}
            >
              {settings.bio}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
