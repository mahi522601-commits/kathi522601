export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf0] px-4">
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-gold/25" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-r-maroon border-t-gold motion-safe:animate-spin" />
          <div className="absolute inset-5 rounded-full bg-white shadow-[0_16px_45px_rgba(28,18,10,0.14)]" />
          <img
            src="/logo.png"
            alt="Khyathi Collections"
            className="relative h-16 w-16 object-contain"
            decoding="async"
          />
        </div>
        <div className="h-1 w-36 overflow-hidden rounded-full bg-[#eadfca]">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-gold via-maroon to-gold motion-safe:animate-premium-loader" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          {label}
        </p>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="aspect-[9/16] min-h-[310px] w-full animate-pulse bg-gray-200 sm:min-h-[420px] lg:min-h-[460px]" />

      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />

        <div className="flex gap-2">
          <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />

          <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />

          <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
