/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--bv-text)",
        muted: "var(--bv-muted)",
        canvas: "var(--bv-background)",
        surface: "var(--bv-surface)",
        forest: "var(--bv-primary)",
        copper: "rgb(var(--bv-accent-rgb) / <alpha-value>)",
        paper: "rgb(var(--bv-secondary-rgb) / <alpha-value>)",
        brand: {
          50: "#edf2ed",
          100: "#dbe6dd",
          500: "#315b49",
          600: "#274b3c",
          700: "#1c3a2f",
        },
        success: "var(--bv-success)",
        warning: "var(--bv-warning)",
        error: "var(--bv-error)",
      },
      boxShadow: {
        card: "0 2px 6px rgba(35, 44, 37, 0.045), 0 12px 30px rgba(35, 44, 37, 0.035)",
        lift: "0 18px 48px rgba(32, 59, 50, 0.12)",
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
