const SKELETON_HEIGHTS = ["h-48", "h-64", "h-56", "h-72", "h-52", "h-60", "h-44", "h-[17rem]"];

export default function Loading() {
  return (
    <div className="min-h-full">
      <div className="border-b border-line px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="h-3 w-20 animate-pulse rounded bg-line" />
          <div className="mt-6 h-3 w-12 animate-pulse rounded bg-accent/30" />
          <div className="mt-5 h-12 w-64 max-w-full animate-pulse rounded bg-line sm:h-16 sm:w-96" />
          <div className="mt-4 h-4 w-72 max-w-full animate-pulse rounded bg-line" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 h-8 w-40 animate-pulse rounded bg-line" />
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [column-gap:0.75rem] sm:[column-gap:1rem]">
          {SKELETON_HEIGHTS.map((heightClass, index) => (
            <div
              key={index}
              className={`mb-3 break-inside-avoid animate-pulse bg-line sm:mb-4 ${heightClass}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
