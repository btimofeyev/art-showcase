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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="col-span-2 row-span-2 aspect-[4/5] animate-pulse bg-line sm:min-h-[28rem]" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[4/5] animate-pulse bg-line" />
          ))}
        </div>
      </div>
    </div>
  );
}
