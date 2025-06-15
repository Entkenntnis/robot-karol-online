import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    extends: ['next'],
    rules: {
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
])
