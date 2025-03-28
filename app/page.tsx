'use client'

import dynamic from 'next/dynamic'
import { CoreProvider, useCreateCore } from '../lib/state/core'

const App = dynamic(() => import('../components/App').then((mod) => mod.App), {
  ssr: false,
  loading: () => (
    <div className="absolute top-0 right-0 p-2">
      <div className="w-6 h-6 border-2 border-[#ffd266] border-t-[#e96b6d] rounded-full animate-spin" />
    </div>
  ),
})

export default function Index() {
  const core = useCreateCore()
  return (
    <CoreProvider value={core}>
      <App />
    </CoreProvider>
  )
}
