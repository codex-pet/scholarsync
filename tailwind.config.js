/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: "#FAF9F6",
        lavender: "#D1D1FF",
        sage: "#E2F0CB",
        peach: "#FFD8BE",
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      fontFamily: {
        heading: ['Quicksand', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}