/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#14181f',
          700: '#2b313d',
          500: '#5b6473',
          300: '#aab2bf',
          100: '#e7eaef',
        },
        brand: {
          DEFAULT: '#2f5d50',
          light: '#3f7a6a',
          dark: '#1f4038',
        },
        accent: '#d97b3f',
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
