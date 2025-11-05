/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'boxing-green': '#00D26A',
        'boxing-yellow': '#FFD84D',
        'boxing-red': '#FF4D4F',
        'boxing-bg': '#0B0B0C',
      },
      spacing: {
        'ring-radius': '150px',
      },
      fontSize: {
        'display': ['64px', { lineHeight: '1' }],
        'heading': ['32px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};
