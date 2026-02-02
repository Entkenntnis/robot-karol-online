import { useEffect } from 'react'
import { IdeMain } from '../ide/IdeMain'
import { useCore } from '../../lib/state/core'
import { saveEditorSnapshot } from '../../lib/storage/storage'

export function Editor() {
  // create a timer that runs every 2 seconds
  const core = useCore()
  useEffect(() => {
    const timer = setInterval(() => {
      saveEditorSnapshot(core)
    }, 2000)

    return () => clearInterval(timer)
    // I could in theory use a dep-array to only update when the state changes,
    // but this would be a performance hit, because the state changes every time I type something in the editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <IdeMain />
}
