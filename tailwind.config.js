/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0f172a", // Dark slate background
        lavender: "#BDB2FF", // Original lavender
        terracotta: "#ef4444", // Red alerts
        emerald: "#10b981", // Green success

        // Semantic overrides
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "rgba(15, 23, 42, 0.7)",
        "card-foreground": "hsl(var(--foreground))",
        primary: "#BDB2FF",
        "primary-foreground": "#0f172a",
        secondary: "#1e293b",
        "secondary-foreground": "#f8fafc",
        muted: "rgba(255, 255, 255, 0.05)",
        "muted-foreground": "#94a3b8",
        border: "rgba(255, 255, 255, 0.1)",
        crimson: "#e11d48",

      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glass-hover': 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
      },
      backdropBlur: {
        '3xl': '64px',
        '4xl': '80px',
      },
      animation: {
        "pulse-slow":    "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float":         "float 6s ease-in-out infinite",
        "shimmer":       "schematic-shimmer 1.8s linear infinite",
        "orbit":         "orbit 3s linear infinite",
        "scan":          "scan-sweep 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
}
