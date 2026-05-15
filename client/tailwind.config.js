/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--bg-primary)',
        'header-cream': 'var(--bg-primary)',
        announcement: 'var(--bg-dark)',
        gold: 'var(--color-gold)',
        'gold-dark': 'var(--color-gold-dark)',
        'gold-light': 'var(--color-gold-light)',
        maroon: 'var(--color-maroon)',
        rose: 'var(--color-rose)',
        card: 'var(--bg-card)',
        borderwarm: 'var(--border-color)',
        primary: 'var(--text-primary)',
        body: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Jost', '"Helvetica Neue"', 'sans-serif'],
      },
      boxShadow: {
        soft: 'var(--shadow-md)',
        card: 'var(--shadow-sm)',
        gold: 'var(--shadow-gold)',
      },
      backgroundImage: {
        linen:
          'radial-gradient(circle at top, rgba(255,255,255,0.85), rgba(250,247,242,0.94)), linear-gradient(135deg, rgba(201,168,76,0.06), rgba(255,255,255,0))',
        'deco-grid':
          'linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        chatPulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(201,168,76,0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 12px rgba(201,168,76,0)' },
        },
        sparkleRotate: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        shimmer: 'shimmer 1.5s linear infinite',
        'chat-pulse': 'chatPulse 3s infinite',
        'sparkle-rotate': 'sparkleRotate 5s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
    },
  },
  plugins: [],
};
