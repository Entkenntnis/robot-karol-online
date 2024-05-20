const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  output: 'export',
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas', ws: 'ws' }] // required to make blockly work
    return config
  },
})
