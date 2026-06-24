import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
      <div className="accent-rule mx-auto" />
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
        Not found
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
        This piece may have been removed or isn&apos;t published yet.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center bg-accent px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Back to gallery
      </Link>
    </div>
  );
}
