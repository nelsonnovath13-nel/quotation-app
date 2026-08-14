import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#6366f1",
          500: "#4338ca",
          600: "#3730a3",
          700: "#312e81",
        },
        accent: {
          500: "#0d9488",
          600: "#0f766e",
        },
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
        },
        ink: {
          900: "#1c1917",
          700: "#44403c",
          500: "#78716c",
        },
        success: "#15803d",
        warning: "#b45309",
        danger: "#b91c1c",
        info: "#1d4ed8",
      },
      borderRadius: {
        card: "12px",
        control: "10px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
