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
    },
  },
} satisfies Config
