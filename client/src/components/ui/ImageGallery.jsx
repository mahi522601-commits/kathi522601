import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import ImageViewer from './ImageViewer';

function imageUrl(image) {
  return image?.displayUrl || image?.url || image?.thumbnail || image || '';
}

export default function ImageGallery({ images, productName }) {
  const galleryImages = Array.isArray(images)
    ? images.map((image) =>
        typeof image === 'string'
          ? { url: image, displayUrl: image, thumbnail: image, width: 1200, height: 1600 }
          : image,
      )
    : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x, y });
  };

  if (!galleryImages.length) {
    return null;
  }

  return (
    <>
      <div className="flex gap-4">
        <div className="hidden w-20 flex-col gap-3 md:flex">
          {galleryImages.map((image, index) => (
            <motion.button
              key={imageUrl(image) || index}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                index === activeIndex ? 'border-gold' : 'border-borderwarm'
              }`}
            >
              <img
                src={image.thumbnail || imageUrl(image)}
                alt={`${productName} view ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </motion.button>
          ))}
        </div>

        <div className="relative flex-1">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-2xl bg-[#f3ede4]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setViewerOpen(true)}
          >
            <img
              src={imageUrl(galleryImages[activeIndex])}
              alt={productName}
              className="h-full w-full object-cover"
              style={{
                transformOrigin: `${lensPos.x}% ${lensPos.y}%`,
                transform: isHovering ? 'scale(1.5)' : 'scale(1)',
                transition: isHovering ? 'transform 0s' : 'transform 0.3s ease',
                imageRendering: 'high-quality',
              }}
            />
            <button
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 opacity-0 backdrop-blur transition group-hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                setViewerOpen(true);
              }}
            >
              <Maximize2 size={16} className="text-primary" />
            </button>
          </motion.div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {galleryImages.map((image, index) => (
              <button
                key={imageUrl(image) || index}
                onClick={() => setActiveIndex(index)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  index === activeIndex ? 'border-gold' : 'border-borderwarm'
                }`}
              >
                <img src={image.thumbnail || imageUrl(image)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewerOpen ? (
        <ImageViewer
          images={galleryImages}
          initialIndex={activeIndex}
          onClose={() => setViewerOpen(false)}
        />
      ) : null}
    </>
  );
}
