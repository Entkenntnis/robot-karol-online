module.exports = {
  content: ['./components/**/*.tsx', './app/**/*.tsx', './lib/**/*.tsx'],
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
