import { useEffect, useRef } from 'react'
import { initClient } from '../../lib/commands/init'
import { useCore } from '../../lib/state/core'
import { LoadingScreen } from '../helper/LoadingScreen'

export function Init() {
  const core = useCore()
  const isInit = useRef(false)
  useEffect(() => {
    if (isInit.current) return
    isInit.current = true
    initClient(core)
    core.mutateWs((ws) => {
      ws.ui.initDone = true
    })
    window.addEventListener('hashchange', () => {
      window.location.reload()
    })
    // only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <LoadingScreen />
}
