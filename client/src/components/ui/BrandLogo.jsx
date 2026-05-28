import { useEffect, useState } from 'react';

let cachedLogoSrc = null;
let cachedLogoPromise = null;

function isSubjectPixel(r, g, b, a) {
  if (a === 0) {
    return false;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = (r + g + b) / 3;
  const saturation = max - min;

  return brightness > 92 || saturation > 34 || (brightness > 55 && max > 78);
}

function removeBackgroundAndCrop() {
  if (cachedLogoSrc) {
    return Promise.resolve(cachedLogoSrc);
  }

  if (cachedLogoPromise) {
    return cachedLogoPromise;
  }

  cachedLogoPromise = new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const maxDimension = 640;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = Math.round(image.naturalWidth * scale);
        sourceCanvas.height = Math.round(image.naturalHeight * scale);

        const context = sourceCanvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);

        const imageData = context.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const { data, width, height } = imageData;
        const blocked = new Uint8Array(width * height);
        const background = new Uint8Array(width * height);
        const queue = [];
        let queueIndex = 0;

        for (let index = 0; index < data.length; index += 4) {
          const pixelIndex = index / 4;
          blocked[pixelIndex] = isSubjectPixel(
            data[index],
            data[index + 1],
            data[index + 2],
            data[index + 3],
          )
            ? 1
            : 0;
        }

        function enqueue(x, y) {
          if (x < 0 || y < 0 || x >= width || y >= height) {
            return;
          }

          const pixelIndex = y * width + x;
          if (background[pixelIndex] || blocked[pixelIndex]) {
            return;
          }

          background[pixelIndex] = 1;
          queue.push(pixelIndex);
        }

        for (let x = 0; x < width; x += 1) {
          enqueue(x, 0);
          enqueue(x, height - 1);
        }

        for (let y = 0; y < height; y += 1) {
          enqueue(0, y);
          enqueue(width - 1, y);
        }

        while (queueIndex < queue.length) {
          const pixelIndex = queue[queueIndex];
          queueIndex += 1;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);

          enqueue(x + 1, y);
          enqueue(x - 1, y);
          enqueue(x, y + 1);
          enqueue(x, y - 1);
        }

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;

        for (let index = 0; index < width * height; index += 1) {
          if (!background[index]) {
            continue;
          }

          const offset = index * 4;
          data[offset + 3] = 0;
        }

        for (let index = 0; index < width * height; index += 1) {
          const offset = index * 4;
          if (data[offset + 3] <= 8) {
            continue;
          }

          const x = index % width;
          const y = Math.floor(index / width);
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }

        if (minX >= maxX || minY >= maxY) {
          cachedLogoSrc = '/logo.png';
          resolve(cachedLogoSrc);
          return;
        }

        context.putImageData(imageData, 0, 0);

        const padding = Math.round(Math.max(width, height) * 0.045);
        const cropWidth = maxX - minX + 1;
        const cropHeight = maxY - minY + 1;

        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = cropWidth + padding * 2;
        outputCanvas.height = cropHeight + padding * 2;

        const outputContext = outputCanvas.getContext('2d');
        outputContext.drawImage(
          sourceCanvas,
          minX,
          minY,
          cropWidth,
          cropHeight,
          padding,
          padding,
          cropWidth,
          cropHeight,
        );

        cachedLogoSrc = outputCanvas.toDataURL('image/png');
        resolve(cachedLogoSrc);
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = reject;
    image.src = '/logo.png';
  });

  return cachedLogoPromise;
}

const sizeClasses = {
  sm: 'h-11 w-11',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
};

export default function BrandLogo({
  size = 'md',
  className = '',
  imageClassName = 'h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(44,26,14,0.16)]',
  placeholderClassName = 'h-full w-full rounded-full bg-[radial-gradient(circle_at_center,_rgba(201,168,76,0.18),_transparent_68%)]',
  alt = 'Khyathi Collections',
}) {
  const [logoSrc, setLogoSrc] = useState(cachedLogoSrc);

  useEffect(() => {
    let mounted = true;

    removeBackgroundAndCrop()
      .then((src) => {
        if (mounted) {
          setLogoSrc(src);
        }
      })
      .catch(() => {
        if (mounted) {
          setLogoSrc('/logo.png');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={alt}
          className={imageClassName}
          loading="eager"
        />
      ) : (
        <span className={placeholderClassName} />
      )}
    </span>
  );
}
