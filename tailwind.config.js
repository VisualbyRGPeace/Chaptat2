/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#121218",
          800: "#1a1a24",
          700: "#242430",
          600: "#33333f",
        },
        gold: {
          400: "#f2c14e",
          500: "#e0a72a",
          600: "#b8871f",
        },
        rarity: {
          common: "#4ade80",
          rare: "#38bdf8",
          epic: "#c084fc",
          legendary: "#facc15",
        },
      },
      fontFamily: {
        display: ["'Cinzel'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      animation: {
        "flip-in": "flipIn 0.6s ease forwards",
        "deck-shake": "deckShake 0.3s ease",
        "fade-in": "fadeIn 0.3s ease forwards",
      },
      keyframes: {
        flipIn: {
          "0%": { transform: "rotateY(180deg) scale(0.8)", opacity: "0" },
          "100%": { transform: "rotateY(0deg) scale(1)", opacity: "1" },
        },
        deckShake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px) rotate(-1deg)" },
          "75%": { transform: "translateX(2px) rotate(1deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
