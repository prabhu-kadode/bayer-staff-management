/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#0066cc",
        secondary: "#00cc99",
        danger: "#ff3333",
        warning: "#ffaa00",
        success: "#00cc66",
      },
    },
  },
  plugins: [],
};
