import { App } from '../components/App'
import { CoreProvider, useCreateCore } from '../lib/state/core'

export default function Index() {
  const core = useCreateCore()
  return (
    <CoreProvider value={core}>
      <App />
      <style jsx global>
        {`
          body,
          html,
          #__next {
            height: 100%;
          }
        `}
      </style>
    </CoreProvider>
  )
}
