/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF5EC",
          50: "#FFFDFA",
          100: "#FBF5EC",
          200: "#F4EADA",
        },
        ink: {
          DEFAULT: "#2B2420",
          light: "#5B5148",
          muted: "#8A7F73",
        },
        rust: {
          DEFAULT: "#BF4E2E",
          50: "#FDF1EC",
          100: "#F9DCD0",
          400: "#D66F4D",
          500: "#BF4E2E",
          600: "#A03F24",
          700: "#7E301B",
        },
        sage: {
          DEFAULT: "#46705B",
          50: "#EEF4F0",
          100: "#D6E5DC",
          400: "#5C8871",
          500: "#46705B",
          600: "#345444",
        },
        gold: {
          DEFAULT: "#E3A857",
          50: "#FDF6EA",
          100: "#FAE8C8",
          400: "#E3A857",
          500: "#D18F35",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      boxShadow: {
        warm: "0 8px 24px -8px rgba(120, 74, 50, 0.18)",
        "warm-sm": "0 2px 10px -2px rgba(120, 74, 50, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
