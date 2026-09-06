/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        geo: {
          bg: '#F5F7FA',
          card: '#FFFFFF',
          cardMuted: '#F8FAFC',
          border: '#E2E8F0',
          borderDark: '#CBD5E1',
          textMain: '#1F2937',
          textMuted: '#64748B',
          primary: '#2563EB',
          primaryHover: '#1D4ED8'
        },
        hazard: {
          normal: '#16A34A',
          watch: '#EAB308',
          warning: '#F97316',
          critical: '#DC2626'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
