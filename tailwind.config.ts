import { type Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'rose-25': '#fff1f2',
        'purple-25': '#faf5ff',
        'blue-25': '#f0f9ff',
        'amber-25': '#fffbeb',
        'emerald-25': '#f0fdf4',
        'cyan-25': '#ecfeff',
        'teal-25': '#f0fdfa',
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
      borderColor: {
        'rose-25': '#ffe4e6',
        'purple-25': '#f3e8ff',
        'blue-25': '#e0f2fe',
        'amber-25': '#fef3c7',
        'emerald-25': '#d1fae5',
        'cyan-25': '#cffafe',
        'teal-25': '#ccfbf1',
      },
      backgroundColor: {
        'rose-10': '#fff1f2',
        'purple-10': '#faf5ff',
        'blue-10': '#f0f9ff',
        'amber-10': '#fffbeb',
        'emerald-10': '#f0fdf4',
        'cyan-10': '#ecfeff',
        'teal-10': '#f0fdfa',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
} satisfies Config