/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:     "#0d1117",
        bg2:    "#161b22",
        bg3:    "#21262d",
        border: "#30363d",
        accent: "#58a6ff",
        green:  "#3fb950",
        yellow: "#d29922",
        red:    "#f85149",
        purple: "#bc8cff",
        text2:  "#8b949e",
      },
    },
  },
  plugins: [],
};