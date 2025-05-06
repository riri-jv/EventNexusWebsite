/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',       // <- app directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // <- components
    './pages/**/*.{js,ts,jsx,tsx,mdx}',      // <- legacy support if needed
    './src/**/*.{js,ts,jsx,tsx,mdx}',        // <- safety for src-based setups
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
