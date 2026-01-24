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
          50: '#f0f4ff',
          100: '#e1e9ff',
          500: '#6366f1', // Indigo 500
          600: '#4f46e5', // Indigo 600
          700: '#4338ca', // Indigo 700
        },
        secondary: {
          500: '#f59e0b', // Amber 500
          600: '#d97706', // Amber 600
        },
        accent: {
          500: '#64748b', // Slate 500
          600: '#475569', // Slate 600
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}

