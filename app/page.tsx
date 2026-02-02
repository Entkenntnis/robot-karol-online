import { CoreProvider, useCreateCore } from '../lib/state/core'
import { createRoot } from 'react-dom/client'
import { lazy, Suspense } from 'react'
import { LoadingScreen } from '../components/helper/LoadingScreen'

const App = lazy(() =>
  import('../components/App').then((mod) => ({ default: mod.App })),
)

// Monkey patching console.warn to suppress specific warnings
;(function () {
  const originalWarn = console.warn
  console.warn = function (...args) {
    if (
      typeof args[0] === 'string' &&
      args[0].startsWith(
        'Blockly.Workspace.getAllVariables was deprecated in v12',
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
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </CoreProvider>
  )
}

createRoot(document.getElementById('root')!).render(<Index />)
