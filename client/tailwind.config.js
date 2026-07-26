/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0B1F1A",     // stadium-at-night background
        turf: "#132E23",      // pitch-green panel surface
        turfLight: "#1B3D2E", // hover / raised panel surface
        chalk: "#F3F1E7",     // pitch-line white, primary text on dark
        amber: "#FFC94D",     // scoreboard LED accent
        crimson: "#E1473D",   // loss / red card / danger
        mist: "#7FA294",      // muted secondary text
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
