/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backdropFilter: {
        'none': 'none',
        'blur-sm': 'blur(4px)',
        'blur': 'blur(8px)',
        'blur-lg': 'blur(12px)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-filters'),
  ],
}

