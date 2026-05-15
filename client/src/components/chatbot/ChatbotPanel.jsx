import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { createWelcomeMessage, generateAssistantReply } from '../../chatbot/assistantEngine';
import { useProducts } from '../../hooks/useProducts';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export default function ChatbotPanel({ onClose, context = {} }) {
  const initialMessage = useMemo(() => createWelcomeMessage(context), [context.page]);
  const { products } = useProducts();
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage(text) {
    if (!text.trim()) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const response = generateAssistantReply({
      message: text,
      history,
      products,
      context,
    });

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        role: 'bot',
        ...response,
      },
    ]);
    setHistory((current) => [
      ...current,
      { role: 'user', text },
      { role: 'assistant', text: response.text },
    ]);
    setIsTyping(false);
  }

  function handleReset() {
    setMessages([createWelcomeMessage(context)]);
    setHistory([]);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.96 }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="fixed bottom-[8.75rem] left-3 right-3 z-50 flex max-h-[72vh] w-auto flex-col overflow-hidden rounded-[1.9rem] shadow-2xl md:bottom-28 md:left-auto md:right-6 md:max-h-[640px] md:w-[410px]"
      style={{
        background: 'linear-gradient(180deg, #1C120A 0%, #2A1D10 100%)',
        border: '1px solid rgba(201,168,76,0.26)',
        boxShadow: '0 28px 64px rgba(20,12,7,0.42)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.18)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)' }}
          >
            <Sparkles size={18} className="text-[#1C120A]" />
          </div>
          <div>
            <h3
              className="text-sm font-medium text-white"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}
            >
              Khyathi Assistant
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-white/50">Smart style help</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white/70"
            aria-label="Reset chat"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white/70"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        style={{ scrollbarColor: 'rgba(201,168,76,0.3) transparent' }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onSuggestion={sendMessage} />
        ))}
        {isTyping ? <TypingIndicator /> : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(201,168,76,0.18)' }}>
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                sendMessage(input);
              }
            }}
            placeholder="Ask about sarees, jewellery, delivery, or payments"
            className="flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/30"
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)' }}
          >
            <Send size={14} className="text-[#1C120A]" />
          </motion.button>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/24">
          Local AI-style assistant with curated fashion guidance
        </p>
      </div>
    </motion.div>
  );
}
