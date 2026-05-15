import { motion } from 'framer-motion';

export default function Sparkle({ size = 24, style = {}, animate = false, delay = 0 }) {
  const Component = animate ? motion.svg : 'svg';

  return (
    <Component
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ position: 'absolute', color: 'var(--color-gold)', ...style }}
      animate={
        animate
          ? {
              rotate: [0, 180, 360],
              scale: [1, 1.15, 1],
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
              delay,
            }
          : undefined
      }
    >
      <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5Z" />
    </Component>
  );
}
