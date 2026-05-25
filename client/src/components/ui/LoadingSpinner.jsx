export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-24 w-24">
          <div className="absolute inset-x-5 top-2 h-14 rounded-t-full border-4 border-[#0A1F44] border-b-0" />
          <div className="absolute bottom-3 left-3 h-10 w-10 animate-bounce rounded-full border-4 border-[#C8A96B] bg-[#E5D3B3]" />
          <div className="absolute bottom-3 right-3 h-10 w-10 animate-[bounce_1.2s_ease-in-out_infinite] rounded-full border-4 border-[#0A1F44] bg-white" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#C8A96B] shadow-[0_0_0_8px_rgba(200,169,107,0.18)]" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0A1F44]">
          {label}
        </p>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="h-72 w-full animate-pulse bg-gray-200" />

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
