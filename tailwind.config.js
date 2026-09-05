// TODO: Configure Tailwind with primary color #a459a8
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7edf8',
          100: '#ecd4ee',
          200: '#d9aede',
          300: '#c688ce',
          400: '#b36bbe',
          500: '#a459a8',
          600: '#8f4a93',
          700: '#7a3d7e',
          800: '#653069',
          900: '#502454'
        }
      }
    }
  },
  plugins: []
};
