/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
      fontSize: {
        'base': '1.125rem',    // 18px
        'lg': '1.25rem',       // 20px
        'xl': '1.375rem',      // 22px
        '2xl': '1.5rem',       // 24px
        '3xl': '1.75rem',      // 28px
        '4xl': '2rem',         // 32px
      },
    },
  },
  plugins: [],
};