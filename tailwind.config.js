module.exports = {
  content: [
    './components/**/*.tsx',
    './app/**/*.tsx',
    './lib/**/*.tsx',
    './lib/codemirror/basicSetup.ts',
    './lib/data/chapters/000-intro/info.md',
    './lib/data/chapters/050-schleifen/info.md',
    './index.html',
  ],
  theme: {
    extend: {
      keyframes: {
        'pastel-fade': {
          '0%, 100%': { color: '#C08081' }, // Dusty rose
          '25%': { color: '#5A8D87' }, // Muted teal
          '50%': { color: '#8C80B1' }, // Soft lavender
          '75%': { color: '#D7A77E' }, // Warm peach
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(4px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        // Sliding hand animation
        slideLeftRight: {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '10%': {
            transform: 'translateX(-50%)',
            opacity: '1',
          },
          '45%': {
            transform: 'translateX(50%)',
          },
          '90%': {
            transform: 'translateX(150%)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(200%)',
            opacity: '0',
          },
        },
        // New bubble animation keyframes
        bubble: {
          '0%': {
            transform: 'translateY(0) scale(1)',
            opacity: '0.7',
          },
          '50%': {
            transform: 'translateY(-40%) scale(1.05)',
            opacity: '0.5',
          },
          '100%': {
            transform: 'translateY(-80%) scale(1.1)',
            opacity: '0',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pastel-fade': 'pastel-fade 10s ease-in-out infinite',
        fadeInUp: 'fadeInUp 0.8s ease-out forwards',
        slideLeftRight: 'slideLeftRight 3s ease-in-out infinite',
        bubble: 'bubble 8s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
