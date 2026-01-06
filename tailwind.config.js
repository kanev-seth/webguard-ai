/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#020617", // Base canvas
        lavender: "#BDB2FF", // Primary Accent (Safe/Action)
        terracotta: "#E2725B", // Secondary Accent (Alert/Critical)

        // Semantic overrides
        background: "#020617",
        foreground: "#f8fafc",
        card: "rgba(2, 6, 23, 0.7)",
        "card-foreground": "#f8fafc",
        primary: "#BDB2FF",
        "primary-foreground": "#020617",
        secondary: "#E2725B",
        "secondary-foreground": "#f8fafc",
        muted: "rgba(255, 255, 255, 0.05)",
        "muted-foreground": "#94a3b8",
        border: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glass-hover': 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
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
