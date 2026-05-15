import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

function imageUrl(image) {
  return image?.url || image?.displayUrl || image?.thumbnail || image || '';
}

export default function ImageViewer({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [currentIndex]);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
      if (event.key === '+') handleZoomIn();
      if (event.key === '-') handleZoomOut();
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, zoom]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.15 : 0.15;
    setZoom((current) => Math.min(Math.max(1, current + delta), 5));
  }, []);

  const handleZoomIn = () => setZoom((current) => Math.min(current + 0.5, 5));
  const handleZoomOut = () => setZoom((current) => Math.max(current - 0.5, 1));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (event) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;
    setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);
  const prev = () => setCurrentIndex((index) => (index - 1 + images.length) % images.length);
  const next = () => setCurrentIndex((index) => (index + 1) % images.length);

  async function handleDownload() {
    const response = await fetch(imageUrl(images[currentIndex]));
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `khyathi-${currentIndex + 1}.jpg`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex flex-col bg-black/95"
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <div className="z-10 flex items-center justify-between px-6 py-4">
          <span className="text-sm text-white/60">{currentIndex + 1} / {images.length}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleZoomOut} disabled={zoom <= 1} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30">
              <ZoomOut size={16} />
            </button>
            <button onClick={handleReset} className="rounded bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20">
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={handleZoomIn} disabled={zoom >= 5} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30">
              <ZoomIn size={16} />
            </button>
            <button onClick={handleDownload} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <Download size={16} />
            </button>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-red-500/80">
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className={`relative flex flex-1 items-center justify-center overflow-hidden ${zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => {
            if (zoom === 1) handleZoomIn();
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={imageUrl(images[currentIndex])}
              alt=""
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
                maxWidth: '90vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                userSelect: 'none',
                imageRendering: 'high-quality',
              }}
              draggable={false}
            />
          </AnimatePresence>

          {images.length > 1 ? (
            <>
              <button onClick={(event) => { event.stopPropagation(); prev(); }} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25">
                <ChevronLeft size={22} />
              </button>
              <button onClick={(event) => { event.stopPropagation(); next(); }} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25">
                <ChevronRight size={22} />
              </button>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="flex items-center justify-center gap-3 overflow-x-auto px-6 py-4">
            {images.map((image, index) => (
              <button
                key={imageUrl(image) || index}
                onClick={() => setCurrentIndex(index)}
                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  index === currentIndex
                    ? 'border-gold opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-80'
                }`}
              >
                <img src={imageUrl(image)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
