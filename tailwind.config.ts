import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system tokens
        background:       "var(--background)",
        surface:          "var(--surface)",
        "surface-hover":  "var(--surface-hover)",
        border:           "var(--border)",
        "border-strong":  "var(--border-strong)",
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-disabled":  "var(--text-disabled)",
        accent:           "var(--accent)",
        "accent-muted":   "var(--accent-muted)",
        destructive:      "var(--destructive)",
        success:          "var(--success)",
        // shadcn component mappings
        foreground: "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        input: "var(--input)",
        ring:  "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        sm:      "0 1px 3px rgba(0,0,0,0.5)",
        DEFAULT: "0 1px 3px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
