/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — deep conservation green
        brand: {
          50: '#effaf1',
          100: '#d8f0de',
          200: '#b4e1c1',
          300: '#83ca9a',
          400: '#4fab6f',
          500: '#2e8f51',
          600: '#227240',
          700: '#1d5b36',
          800: '#1a492e',
          900: '#153c27',
          950: '#0a2115',
        },
        // Semantic surface tokens (shadcn-style, neutral)
        surface: {
          DEFAULT: 'hsl(var(--surface, 0 0% 100%))',
        },
        // Neutral (dark theme): low = dark surfaces, high = light text
        ink: {
          50: '#0a0b0d',
          100: '#15181d',
          200: '#20242b',
          300: '#2b313a',
          400: '#3c434d',
          500: '#8b94a1',
          600: '#adb4bf',
          700: '#cdd2da',
          800: '#e3e6eb',
          900: '#f2f4f6',
          950: '#ffffff',
        },
        accent: {
          50: '#fdf7e7',
          100: '#fbeecc',
          200: '#f7dd99',
          300: '#f3c95f',
          400: '#fbbf24',
          500: '#f0a113',
          600: '#d9820c',
          700: '#b35e0c',
          800: '#914a11',
          900: '#783d14',
        },
        gold: '#e7c767',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
        cardHover:
          '0 4px 8px -2px rgb(16 24 40 / 0.08), 0 2px 4px -2px rgb(16 24 40 / 0.05)',
        popover:
          '0 10px 28px -6px rgb(16 24 40 / 0.12), 0 4px 12px -4px rgb(16 24 40 / 0.08)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}