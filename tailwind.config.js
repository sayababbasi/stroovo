/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0052CC",
          dark: "#0d1f3c",
          green: "#00875A",
          yellow: "#FFAB00",
          red: "#FF5630",
          purple: "#6554C0",
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
