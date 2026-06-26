import Link from "next/link";
import type { ArtworkNavLink } from "@/lib/types";
import { cn } from "@/lib/utils";

type ArtworkNavigationProps = {
  previous: ArtworkNavLink | null;
  next: ArtworkNavLink | null;
  className?: string;
};

function NavArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 transition-transform duration-200"
    >
      {direction === "left" ? (
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 3L11 8L6 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function NavLink({
  artwork,
  direction,
}: {
  artwork: ArtworkNavLink;
  direction: "previous" | "next";
}) {
  const isPrevious = direction === "previous";

  return (
    <Link
      href={`/art/${artwork.id}`}
      className={cn(
        "group flex min-h-11 flex-1 items-center gap-3 border border-line bg-surface px-4 py-3 transition-colors hover:border-accent hover:text-accent sm:max-w-[min(100%,20rem)]",
        isPrevious ? "sm:mr-auto" : "sm:ml-auto sm:flex-row-reverse sm:text-right",
      )}
    >
      <NavArrow direction={isPrevious ? "left" : "right"} />
      <span className="min-w-0">
        <span className="label-caps block text-muted transition-colors group-hover:text-accent/80">
          {isPrevious ? "Previous" : "Next"}
        </span>
        <span className="mt-1 block truncate font-display text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-base">
          {artwork.title}
        </span>
      </span>
    </Link>
  );
}

export function ArtworkNavigation({
  previous,
  next,
  className,
}: ArtworkNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Artwork navigation"
      className={cn("mt-10 border-t border-line pt-8 sm:mt-12", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
        {previous ? (
          <NavLink artwork={previous} direction="previous" />
        ) : (
          <div className="hidden flex-1 sm:block" aria-hidden />
        )}
        {next ? <NavLink artwork={next} direction="next" /> : null}
      </div>
    </nav>
  );
}
