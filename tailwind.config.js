/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#f27f0d",
        "cyan-brand": "#06b6d4",
        "background-light": "#f8f7f5",
        "background-dark": "#1c1c1c",
        "surface-dark": "#2d2d2d",
        "surface-light": "#ffffff",
        "border-dark": "#3f3f3f",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      }
    },
  },
  plugins: [],
}
