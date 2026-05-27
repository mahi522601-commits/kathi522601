export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>

        <p className="text-lg font-semibold text-black">
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
