import { CoreProvider, useCreateCore } from '../lib/state/core'
import { createRoot } from 'react-dom/client'
import { lazy, Suspense } from 'react'
import { LoadingScreen } from '../components/helper/LoadingScreen'

const App = lazy(() =>
  import('../components/App').then((mod) => ({ default: mod.App })),
)

function Index() {
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
