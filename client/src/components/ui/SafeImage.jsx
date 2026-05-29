import { useMemo, useState } from 'react';

function initialsFromText(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function SafeImage({
  src,
  alt = '',
  className = '',
  fallbackClassName = '',
  minValidWidth = 0,
  minValidHeight = 0,
  onLoad,
  ...props
}) {
  const [failed, setFailed] = useState(!src);
  const initials = useMemo(() => initialsFromText(alt) || 'KC', [alt]);

  if (failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[#f3ede4] text-center text-primary ${className} ${fallbackClassName}`}
        aria-label={alt}
        role="img"
      >
        <div className="px-4">
          <p className="font-heading text-4xl">{initials}</p>
          <p className="mt-2 line-clamp-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
            Khyathi Collections
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      onLoad={(event) => {
        const image = event.currentTarget;
        if (
          (minValidWidth && image.naturalWidth < minValidWidth) ||
          (minValidHeight && image.naturalHeight < minValidHeight)
        ) {
          setFailed(true);
          return;
        }
        onLoad?.(event);
      }}
      {...props}
    />
  );
}
