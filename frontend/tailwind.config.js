/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Paleta de Marca Tolko ───────────────────────────────
        primary: {
          50:  '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#D62B2B', // Rojo Tolko — color principal
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
          950: '#270505',
        },
        // ─── Superficies (fondos) ────────────────────────────────
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F8F9FA',
          subtle:  '#F1F3F5',
          border:  '#E5E7EB',
        },
        // ─── Tinta (texto, iconos) ───────────────────────────────
        ink: {
          DEFAULT: '#111111', // Negro Tolko — nav, texto fuerte
          dark:    '#0A0A0A',
          muted:   '#6B7280',
          subtle:  '#9CA3AF',
          light:   '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)',
        'card-hover': '0 4px 16px -2px rgba(0,0,0,.12), 0 2px 6px -2px rgba(0,0,0,.08)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}