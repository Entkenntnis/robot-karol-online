module.exports = {
  content: [
    './components/**/*.tsx',
    './app/**/*.tsx',
    './lib/**/*.tsx',
    './lib/codemirror/basicSetup.ts',
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
  },
}
