import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

console.log('  > Warning about headers is expected.')

const nextConfig: NextConfig = {
  output: 'export',
  devIndicators: false,
  experimental: {
    // reduce memory usage during build
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
  },
  // reduce memory usage during build
  webpack: (config, { dev }) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      })
    }
    return config
  },
  // necessary for pyodide to work in a webworker, for dev
  // set proper headers in production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
