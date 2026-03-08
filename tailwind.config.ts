import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        burgundy: {
          DEFAULT: "hsl(var(--burgundy))",
          foreground: "hsl(var(--burgundy-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        badge: {
          top: "hsl(var(--badge-top))",
          "top-foreground": "hsl(var(--badge-top-foreground))",
          calidad: "hsl(var(--badge-calidad))",
          "calidad-foreground": "hsl(var(--badge-calidad-foreground))",
          comienzo: "hsl(var(--badge-comienzo))",
          "comienzo-foreground": "hsl(var(--badge-comienzo-foreground))",
        },
        // Bento 2026 palette
        cream: "#F5F0E8",
        espresso: "#2D2218",
        "espresso-dark": "#1a1208",
        mocha: "#3E2D1F",
        cocoa: "#4A3B2C",
        gold: "#C4A97D",
        "gold-light": "#D4C0A1",
        // Mi Pelo semantic aliases
        "background-light": "#F5F0E8",
        "background-dark":  "#2D2218",
        // Accent orange for wizard UI
        "accent-orange": "#ec5b13",
        "accent-orange-hover": "#d94f0e",
        // Damage level tokens
        "damage-low":  "#4CAF7C",
        "damage-med":  "#E4B84A",
        "damage-high": "#E06B52",
      },
      borderRadius: {
        lg: "6px",
        md: "4px",
        sm: "2px",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        hero: "var(--shadow-hero)",
        // Bento 2026 shadows
        bento: "0 4px 20px -2px rgba(45, 34, 24, 0.05)",
        "bento-hover": "0 8px 30px -4px rgba(45, 34, 24, 0.10)",
        gold: "0 4px 20px rgba(196, 169, 125, 0.25)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      });
    }),
  ],
} satisfies Config;
