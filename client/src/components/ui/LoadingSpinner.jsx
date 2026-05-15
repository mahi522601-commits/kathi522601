export function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="shimmer h-72 w-full" />
      <div className="space-y-3 p-4">
        <div className="shimmer h-4 w-3/4 rounded-full" />
        <div className="shimmer h-4 w-1/2 rounded-full" />
        <div className="flex gap-2">
          <div className="shimmer h-4 w-4 rounded-full" />
          <div className="shimmer h-4 w-4 rounded-full" />
          <div className="shimmer h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}
