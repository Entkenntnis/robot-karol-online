import { useEffect } from 'react'
import { initClient } from '../../lib/commands/init'
import { useCore } from '../../lib/state/core'

export function Init() {
  console.log('render init')

  const core = useCore()
  useEffect(() => {
    initClient(core)
    window.addEventListener('hashchange', () => {
      window.location.reload()
    })
    // only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null // empty page for loading, because loading is quite fast
}
