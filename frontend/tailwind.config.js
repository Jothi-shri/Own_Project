export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: "var(--sans)",
        heading: "var(--heading)",
        mono: "var(--mono)",
      },
    },
  },
  plugins: [],
}
