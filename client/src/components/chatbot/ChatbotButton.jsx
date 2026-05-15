import { motion } from 'framer-motion';

export default function ChatbotButton({ onClick, hasUnread }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-[4.75rem] right-4 z-50 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-xl md:bottom-6 md:right-5 md:h-16 md:w-16"
      style={{
        background: 'linear-gradient(135deg, #1C120A, #4A3728)',
        boxShadow: '0 8px 32px rgba(201,168,76,0.35)',
        animation: 'chatPulse 3s infinite',
      }}
      title="Chat with Khyathi"
    >
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
        <circle cx="20" cy="12" r="6" fill="#C9A84C" opacity="0.9" />
        <path d="M8 32 Q14 18 20 18 Q26 18 32 32" stroke="#C9A84C" strokeWidth="2" fill="none" />
        <path d="M10 28 Q20 20 30 28" stroke="#E8C97A" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M18 18 L14 34" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
        <path d="M22 18 L26 34" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
      </svg>
      {hasUnread ? (
        <span className="absolute right-1 top-1 h-3 w-3 rounded-full border border-white bg-red-500" />
      ) : null}
    </motion.button>
  );
}
