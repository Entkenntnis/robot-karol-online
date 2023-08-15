'use client'

import { App } from '../components/App'
import { CoreProvider, useCreateCore } from '../lib/state/core'

export default function Index() {
  const core = useCreateCore()
  return (
    <CoreProvider value={core}>
      <App />
    </CoreProvider>
  )
}
