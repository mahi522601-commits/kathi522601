import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-2 w-2 rounded-full"
            style={{ background: '#C9A84C' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
