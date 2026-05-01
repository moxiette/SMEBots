import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SMEBots palette · soft, modern, friendly (lifted from moxiette.com)
        cream: {
          50: "#FFFAF3",
          100: "#FFF4E6",
          200: "#FFE9CC",
        },
        plum: {
          50: "#F5F0FF",
          100: "#E9DFFF",
          200: "#D4BFFF",
          300: "#B999FF",
          400: "#9B72F5",
          500: "#7C4DEB",
          600: "#6635D6",
          700: "#5128B3",
          800: "#3D1E8A",
          900: "#2A1466",
        },
        peach: {
          100: "#FFE5D9",
          200: "#FFC2A8",
          300: "#FFA585",
          400: "#FF8862",
        },
        mint: {
          100: "#D9F5EE",
          200: "#A8E5D4",
          300: "#75D5BB",
          400: "#42C5A2",
        },
        ink: {
          50: "#F8F8F9",
          100: "#EDEDEF",
          400: "#71717A",
          600: "#3F3F46",
          900: "#18181B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        "shimmer": "shimmer 3s linear infinite",
        "fade-up": "fadeUp 0.6s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
