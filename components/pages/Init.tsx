import { useEffect, useRef } from 'react'
import { useCore } from '../../lib/state/core'
import { LoadingScreen } from '../helper/LoadingScreen'
import { hydrateFromHash } from '../../lib/commands/router'
import { setLockToKarolCode } from '../../lib/storage/storage'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'

export function Init() {
  const core = useCore()

  // ok, not good, but prevent react double rendering to call hydrate twice
  const currentlyHydrating = useRef<boolean>(false)

  useEffect(() => {
    async function hydrate() {
      currentlyHydrating.current = true
      await hydrateFromHash(core)
      currentlyHydrating.current = false
    }

    // take care of search parameters here

    const parameterList = new URLSearchParams(window.location.search)

    const code = parameterList.get('code')
    if (code) {
      setLockToKarolCode()
      window.open('/', '_self')
      return
    }

    const id = parameterList.get('id')

    if (id) {
      if (id == 'Z9xO1rVGj') {
        submitAnalyzeEvent(core, 'ev_show_playgroundLegacyLink')
        window.open('/#SPIELWIESE', '_self')
        return
      }
      window.open('/#LEGACY:' + id, '_self')
      return
    }

    if (!currentlyHydrating.current) hydrate()
  }, [core])

  return <LoadingScreen />
}
