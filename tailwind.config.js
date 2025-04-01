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
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pastel-fade': 'pastel-fade 10s ease-in-out infinite',
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
