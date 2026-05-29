import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ----- Primitives -----
        point: {
          50: "var(--color-point-50)",
          100: "var(--color-point-100)",
          200: "var(--color-point-200)",
          300: "var(--color-point-300)",
          400: "var(--color-point-400)",
          500: "var(--color-point-500)",
          600: "var(--color-point-600)",
          700: "var(--color-point-700)",
          800: "var(--color-point-800)",
        },
        gray: {
          "050": "var(--color-gray-050)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
        red: {
          100: "var(--color-red-100)",
          200: "var(--color-red-200)",
          300: "var(--color-red-300)",
          400: "var(--color-red-400)",
          500: "var(--color-red-500)",
        },
        yellow: {
          100: "var(--color-yellow-100)",
          300: "var(--color-yellow-300)",
          400: "var(--color-yellow-400)",
          500: "var(--color-yellow-500)",
          700: "var(--color-yellow-700)",
        },
        green: {
          100: "var(--color-green-100)",
          300: "var(--color-green-300)",
          500: "var(--color-green-500)",
          700: "var(--color-green-700)",
        },

        // ----- Semantic — Background -----
        bg: {
          normal: "var(--bg-normal)",
          elevated: "var(--bg-elevated)",
          page: "var(--bg-page)",
          subtle: "var(--bg-subtle)",
          button: "var(--bg-button)",
          disabled: "var(--bg-disabled)",
        },

        // ----- Semantic — Text (use as text-fg-*) -----
        fg: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
          inverse: "var(--text-inverse)",
          point: "var(--text-point)",
          warning: "var(--text-warning)",
        },

        // ----- Semantic — Border (use as border-stroke-*) -----
        stroke: {
          thin: "var(--border-thin)",
          normal: "var(--border-normal)",
          thick: "var(--border-thick)",
          point: "var(--border-point)",
          "point-hover": "var(--border-point-hover)",
          warning: "var(--border-warning)",
          secondary: "var(--border-secondary)",
        },

        // ----- Semantic — Status -----
        status: {
          "success-bg": "var(--status-success-bg)",
          "success-border": "var(--status-success-border)",
          success: "var(--status-success)",
          "success-strong": "var(--status-success-strong)",
          "pending-bg": "var(--status-pending-bg)",
          "pending-border": "var(--status-pending-border)",
          pending: "var(--status-pending)",
          "pending-strong": "var(--status-pending-strong)",
        },

        // ----- shadcn/ui 호환 -----
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
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        point: "var(--shadow-point)",
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
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
        "mascot-drive": {
          "0%, 100%": { transform: "translateY(0) rotate(-1.5deg)" },
          "25%": { transform: "translateY(-4px) rotate(1.5deg)" },
          "50%": { transform: "translateY(0) rotate(-1deg)" },
          "75%": { transform: "translateY(-2px) rotate(1deg)" },
        },
        "motion-line": {
          "0%": { transform: "translateX(60px)", opacity: "0" },
          "15%": { opacity: "0.85" },
          "100%": { transform: "translateX(-140px)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "mascot-drive": "mascot-drive 0.7s ease-in-out infinite",
        "motion-line": "motion-line 0.9s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
