/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // This enables the .dark block in your CSS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This scans everything in src
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... make sure these match your CSS variables
      },
    },
  },
  plugins: [],
};
