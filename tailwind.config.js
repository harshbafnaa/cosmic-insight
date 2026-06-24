/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cosmic Slate Theme
        void: '#0B0B0F',        // deepest background
        slate: {
          950: '#0F0F14',
          900: '#15151C',
          800: '#1C1C26',
          700: '#262631',
          600: '#33333F',
        },
        gold: {
          DEFAULT: '#F4D03F',   // cosmic gold
          soft: '#F7DC6F',
          deep: '#C9A227',
          muted: '#8A7320',
        },
        amber: {
          glow: '#FFC857',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(244, 208, 63, 0.35)',
        'glow-lg': '0 0 60px -10px rgba(244, 208, 63, 0.4)',
      },
      backgroundImage: {
        'twilight': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(244,208,63,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(124,58,237,0.08), transparent 60%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-slow': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'fade-in-slow': 'fade-in-slow 1s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [],
}
