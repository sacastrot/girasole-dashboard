/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta corporativa aproximada de ISA. No corresponde a códigos de
        // marca oficiales; son tokens definidos para este proyecto interno,
        // consistentes con otros desarrollos del programa Girasole.
        'isa-navy': {
          DEFAULT: '#0B2545',
          light: '#163862',
          dark: '#071A33',
        },
        'isa-blue': {
          DEFAULT: '#1959B8',
          light: '#4C8DDB',
          dark: '#123F87',
        },
        'isa-gray': {
          50: '#F7F8FA',
          100: '#EEF1F5',
          200: '#DDE3EA',
          400: '#94A0AF',
          600: '#5B6675',
          800: '#333B47',
          900: '#1B212B',
        },
        'girasole': {
          orange: '#F7941D',
          yellow: '#FDB913',
        },
        'seguridad': {
          'muy-bajo': '#1E9E5A',
          bajo: '#7CB518',
          medio: '#F2A900',
          alto: '#D64545',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(11, 37, 69, 0.06), 0 1px 3px 0 rgba(11, 37, 69, 0.08)',
        'card-hover': '0 4px 10px 0 rgba(11, 37, 69, 0.12)',
      },
    },
  },
  plugins: [],
}
