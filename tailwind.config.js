/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        galaxy: {
          dark: '#0A0A0A',
          purple: '#2D1B4E',
          teal: '#00A6A6',
          gold: '#FFC107',
          orange: '#FF6B35',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

