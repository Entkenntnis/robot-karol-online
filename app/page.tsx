'use client'

import dynamic from 'next/dynamic'
import { CoreProvider, useCreateCore } from '../lib/state/core'
import { LoadingScreen } from '../components/helper/LoadingScreen'

const App = dynamic(() => import('../components/App').then((mod) => mod.App), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.TONE_SILENCE_LOGGING = true
}

// Monkey patching console.warn to suppress specific warnings
;(function () {
  const originalWarn = console.warn
  console.warn = function (...args) {
    if (
      typeof args[0] === 'string' &&
      args[0].startsWith(
        'Blockly.Workspace.getAllVariables was deprecated in v12'
      )
    ) {
      return
    }
    originalWarn.apply(console, args)
  }
})()

export default function Index() {
  const core = useCreateCore()
  return (
    <CoreProvider value={core}>
      <App />
    </CoreProvider>
  )
}
