/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7fb',
          100: '#e8eef6',
          200: '#c9d7ea',
          300: '#a3bad8',
          400: '#6488b9',
          500: '#3f6399',
          600: '#2b4a7a',
          700: '#1d3560',
          800: '#14264a',
          900: '#0b1a38',
          950: '#07101f',
        },
        niter: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gold: {
          50: '#fbf8eb',
          100: '#f5eecb',
          200: '#ecdc97',
          300: '#e2c862',
          400: '#d9b53d',
          500: '#c9a227',
          600: '#a98520',
          700: '#86671c',
          800: '#6f531d',
          900: '#5f461e',
        },
        mint: '#0d9488',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgb(11 26 56 / 0.14)',
        lift: '0 14px 40px -12px rgb(11 26 56 / 0.25)',
        card: '0 1px 2px rgb(11 26 56 / 0.06), 0 8px 24px -12px rgb(11 26 56 / 0.12)',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.12) translate(1.5%, -1.5%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgb(16 185 129 / 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        kenburns: 'kenburns 9s ease-out forwards',
        fadeUp: 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        fadeIn: 'fadeIn 0.5s ease both',
        slideDown: 'slideDown 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
        slideInRight: 'slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        pulseDot: 'pulseDot 1.6s ease-out infinite',
        shimmer: 'shimmer 1.4s linear infinite',
        float: 'float 5s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};
