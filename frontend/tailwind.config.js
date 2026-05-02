/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563EB', // Main primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981', // Main secondary
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        status: {
          pending: '#F59E0B',    // Orange
          verified: '#3B82F6',   // Blue
          production: '#8B5CF6', // Purple
          success: '#10B981',    // Green
          rejected: '#EF4444',   // Red
        },
      },
      spacing: {
        xs: '0.5rem',  // 8px
        sm: '0.75rem', // 12px
        md: '1rem',    // 16px
        lg: '1.5rem',  // 24px
        xl: '2rem',    // 32px
        '2xl': '3rem', // 48px
      },
      borderRadius: {
        sm: '0.25rem',   // 4px - inputs
        md: '0.5rem',    // 8px - buttons
        lg: '0.75rem',   // 12px - cards
        xl: '1rem',      // 16px - modals
        '2xl': '1.5rem', // 24px - hero sections
        full: '9999px'   // pills, badges
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        card: '0 2px 8px rgba(0, 0, 0, 0.08)', // Custom for cards
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
