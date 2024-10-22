/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg_1": "#FCFDFF",
        "bg_2": "#F4F4F4",
        "bg_3": "#EEEEEE",
        "bg_4": "#E5E5E5",
      },
      width: {
        "1": "1px",
        "120": "30rem"
      },
    },
  },
  plugins: [],
};
