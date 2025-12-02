/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cinzel', 'ui-serif', 'Georgia', 'serif'],
        mono: ['Space Mono', 'ui-monospace', 'Consolas', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'Arial', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'scanline': 'scanline 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'noise': 'noise 0.2s steps(2) infinite',
        'data-scroll': 'data-scroll 10s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { top: '0%', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        noise: {
          '0%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(-4px, 4px)' },
          '50%': { transform: 'translate(4px, -4px)' },
          '75%': { transform: 'translate(-4px, -4px)' },
          '100%': { transform: 'translate(4px, 4px)' },
        },
        'data-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
