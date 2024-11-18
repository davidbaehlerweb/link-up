/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{html,js,ts,jsx,tsx}"
  ],
  theme: {
      extend: {
          colors: {
              primary: "#ff8901",
              secondary: "#fb923c",
          },
          container: {
              center: true,
              padding: {
                  DEFAULT: '1rem',
                  sm: '2rem',
                  lg: '4rem',
                  xl: '5rem',
                  "2xl": '6rem',
              },
          },
      },
  },
  plugins: [],
}

