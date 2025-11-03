export default {
  darkMode: "class",
  content: [
    "./app/app.vue",
    "./app/components/**/*.{vue,ts}",
    "./app/layouts/**/*.{vue,ts}",
    "./app/pages/**/*.{vue,ts}",
    "./app/assets/css/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        muted: "var(--muted)",
        border: "var(--border)",
        borderStrong: "var(--border-strong)",
        accent: "var(--accent)",
        accentContrast: "var(--accent-contrast)",
        error: "var(--error)",
        errorBorder: "var(--error-border)",
      },
      borderRadius: { xl: "1rem" },
      boxShadow: { soft: "0 2px 10px rgba(0,0,0,.05)" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
    },
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
    },
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
  },
  plugins: [],
};
