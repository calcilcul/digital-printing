/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A8A", // Dark Blue (Blue 900)
          light: "#3B82F6", // Blue 500
          dark: "#1E40AF", // Blue 800
        },
        surface: "#F8FAFC", // Slate 50
        border: "#E2E8F0", // Slate 200
        text: {
          DEFAULT: "#0F172A", // Slate 900
          muted: "#64748B", // Slate 500
        },
        success: "#10B981", // Emerald 500
        warning: "#F59E0B", // Amber 500
        error: "#EF4444", // Red 500
      },
    },
  },
  plugins: [],
}
