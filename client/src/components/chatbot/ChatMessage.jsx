import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatProductCard from './ChatProductCard';

function formatText(text = '') {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function ChatMessage({ message, onSuggestion }) {
  const isBot = message.role === 'bot';
  const [visibleText, setVisibleText] = useState(isBot ? '' : message.text);
  const [completedTyping, setCompletedTyping] = useState(!isBot);

  useEffect(() => {
    if (!isBot) {
      setVisibleText(message.text);
      setCompletedTyping(true);
      return undefined;
    }

    setVisibleText('');
    setCompletedTyping(false);
    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(message.text.slice(0, index));

      if (index >= message.text.length) {
        window.clearInterval(timer);
        setCompletedTyping(true);
      }
    }, Math.max(10, 2600 / Math.max(message.text.length, 1)));

    return () => window.clearInterval(timer);
  }, [isBot, message.id, message.text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div className="max-w-[86%]">
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isBot ? 'rounded-tl-sm text-white/90' : 'rounded-tr-sm font-medium text-[#1C120A]'
          }`}
          style={{
            background: isBot
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg, #C9A84C, #E8C97A)',
            fontFamily: 'Jost, sans-serif',
          }}
          dangerouslySetInnerHTML={{ __html: formatText(visibleText) }}
        />

        {completedTyping && isBot && message.products?.length ? (
          <div className="mt-3 grid gap-2">
            {message.products.map((product) => (
              <ChatProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        {completedTyping && isBot && message.suggestions?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestion(suggestion)}
                className="rounded-full border px-3 py-1.5 text-xs transition hover:bg-gold hover:text-[#1C120A] hover:border-gold"
                style={{
                  border: '1px solid rgba(201,168,76,0.4)',
                  color: 'rgba(201,168,76,0.92)',
                  fontFamily: 'Jost, sans-serif',
                  letterSpacing: '0.02em',
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <p className="mt-1 px-1 text-[10px] text-white/20">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}
