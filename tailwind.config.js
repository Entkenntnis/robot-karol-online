module.exports = {
  content: [
    './components/**/*.tsx',
    './app/**/*.tsx',
    './lib/**/*.tsx',
    './lib/codemirror/basicSetup.ts',
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
        // New bubble animation keyframes
        bubble: {
          '0%': { 
            transform: 'translateY(0) scale(1)', 
            opacity: '0.7'
          },
          '50%': { 
            transform: 'translateY(-40%) scale(1.05)', 
            opacity: '0.5' 
          },
          '100%': { 
            transform: 'translateY(-80%) scale(1.1)', 
            opacity: '0' 
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0)', 
          },
          '50%': { 
            transform: 'translateY(-8px)' 
          },
        }
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pastel-fade': 'pastel-fade 10s ease-in-out infinite',
        fadeInUp: 'fadeInUp 0.8s ease-out forwards',
        bubble: 'bubble 8s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
    base: false,
    themes: ['light'],
  },
}
