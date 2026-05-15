export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const fadeSlideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export const staggerContainer = (staggerChildren = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren } },
});

export const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const slideInRight = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 250 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.25 } },
};

export const slideInLeft = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 250 } },
  exit: { x: '-100%', opacity: 0 },
};

export const slideDown = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { y: -20, opacity: 0 },
};

export const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 300 } },
  exit: { scale: 0.9, opacity: 0 },
};

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const popupSlideLeft = {
  hidden: { x: -120, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 20 } },
  exit: { x: -120, opacity: 0, transition: { duration: 0.2 } },
};

export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};
