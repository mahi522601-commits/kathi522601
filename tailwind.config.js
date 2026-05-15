/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--color-bg)',
        'header-cream': 'var(--color-header-bg)',
        announcement: 'var(--color-announcement)',
        gold: 'var(--color-gold)',
        'gold-dark': 'var(--color-gold-dark)',
        maroon: 'var(--color-maroon)',
        card: 'var(--color-card-bg)',
        borderwarm: 'var(--color-border)',
        primary: 'var(--color-text-primary)',
        body: 'var(--color-text-body)',
        muted: 'var(--color-text-muted)',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        body: ['Lato', '"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 40px rgba(44, 26, 14, 0.08)',
        card: '0 10px 30px rgba(44, 26, 14, 0.06)',
      },
      backgroundImage: {
        linen:
          'radial-gradient(circle at top, rgba(255,255,255,0.75), rgba(245,240,235,0.95)), linear-gradient(135deg, rgba(200,169,81,0.06), rgba(255,255,255,0))',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
