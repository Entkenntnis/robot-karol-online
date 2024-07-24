const { default: daisyui } = require('daisyui')

module.exports = {
  content: ['./**/*.tsx'],
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
