'use client'

import dynamic from 'next/dynamic'
import { CoreProvider, useCreateCore } from '../lib/state/core'

const App = dynamic(() => import('../components/App').then((mod) => mod.App), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen bg-[#2e5691]/5">
      <div className="w-10 h-10 border-4 border-[#ffd266] border-t-[#e96b6d] rounded-full animate-spin" />
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
