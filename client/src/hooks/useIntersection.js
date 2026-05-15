import { useEffect, useRef, useState } from 'react';

export function useIntersection(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(node);

    return () => observer.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  return { ref, isVisible };
}
