/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7ef',
          100: '#dcefe0',
          500: '#2f7d4f',
          600: '#25663f',
          700: '#1d5233',
          800: '#17422a',
          900: '#123520',
        },
        amber: { 500: '#f5b642', 600: '#d99a2b' },
      },
    },
  },
  plugins: [],
}