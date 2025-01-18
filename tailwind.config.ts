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
        'rose-50': '#f9a8d4',
        'purple-50': '#e9d5ff',
        'blue-50': '#bfdbfe',
        'amber-50': '#fde68a',
        'emerald-50': '#bbf7d0',
        'cyan-50': '#a5f3fc',
        'teal-50': '#99f6e4',
      },
      backgroundColor: {
        'rose-50': '#fce7f3',
        'purple-50': '#f3e8ff',
        'blue-50': '#dbf0ff',
        'amber-50': '#fffbeb',
        'emerald-50': '#f0fdf4',
        'cyan-50': '#ecfeff',
        'teal-50': '#f0fdfa',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
} satisfies Config