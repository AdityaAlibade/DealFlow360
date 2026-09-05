/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a459a8',
          50: '#faf5fb',
          100: '#f4ebf6',
          200: '#ebd8ee',
          300: '#ddbade',
          400: '#c892cb',
          500: '#a459a8',
          600: '#8c4390',
          700: '#733376',
          800: '#5f2b61',
          900: '#4f2750',
          950: '#341335'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tightest: '-.035em',
        tighter: '-.025em',
        tight: '-.015em',
      }
    },
  },
  plugins: [],
};
