/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'khmer-blue': '#0056B3', // Example brand color
        'khmer-red': '#E02F2F',
      },
    },
  },
  plugins: [],
}