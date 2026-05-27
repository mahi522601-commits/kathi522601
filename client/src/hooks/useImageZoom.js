import { useState } from 'react';

export function useImageZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  function zoomIn(step = 0.25) {
    setZoom((current) => Math.min(current + step, 5));
  }

  function zoomOut(step = 0.25) {
    setZoom((current) => Math.max(current - step, 1));
  }

  function resetZoom() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  return {
    zoom,
    pan,
    setPan,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
