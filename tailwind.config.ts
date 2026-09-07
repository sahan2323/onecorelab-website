import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // Remapped onto the brand blue #1164B7. Plenty of components were
        // authored against `royal-*` before the palette change; rather than
        // rewriting 25 files, the scale itself now resolves to the brand
        // colour so there is only ever one blue on the site.
        royal: {
          50: "#eff6fd",
          100: "#dbeafd",
          200: "#bfdbfa",
          300: "#93c3f5",
          400: "#5fa3ed",
          500: "#2f82dc",
          600: "#1164B7",
          700: "#0e5196",
          800: "#103f74",
          900: "#12365e",
          950: "#0c223e",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ink: "hsl(var(--ink))",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        label: ["var(--font-label)", "sans-serif"],
        // Aliased to the label face on purpose — the design system has no
        // monospace role, and existing `font-mono` usages are all labels.
        mono: ["var(--font-mono)", "sans-serif"],
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)" },
        },
        ripple: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-50%, -50%) scale(0.94)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease forwards",
        marquee: "marquee 28s linear infinite",
        orbit: "orbit calc(var(--duration, 20) * 1s) linear infinite",
        ripple: "ripple 3.2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        lab: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
