import { useEffect, useRef } from 'react'
import { useCore } from '../../lib/state/core'
import { LoadingScreen } from '../helper/LoadingScreen'
import { hydrateFromHash } from '../../lib/commands/router'

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

    if (!currentlyHydrating.current) hydrate()
  }, [core])

  return <LoadingScreen />
}
