import { useEffect } from 'react'
import { IdeMain } from '../ide/IdeMain'
import { EditorSessionSnapshot } from '../../lib/state/types'
import { useCore } from '../../lib/state/core'

export function Editor() {
  // create a timer that runs every 2 seconds
  const core = useCore()
  useEffect(() => {
    const timer = setInterval(() => {
      // create a snapshot
      const snapshot: EditorSessionSnapshot = {
        settings: core.ws.settings,
        editor: core.ws.editor,
        quest: core.ws.quest,
        code: core.ws.code,
        javaCode: core.ws.javaCode,
        pythonCode: core.ws.pythonCode,
      }
      sessionStorage.setItem(
        'robot_karol_online_session_snapshot',
        JSON.stringify(snapshot)
      )
    }, 2000)

    return () => clearInterval(timer)
    // I could in theory use a dep-array to only update when the state changes,
    // but this would be a performance hit, because the state changes every time I type something in the editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <IdeMain />
}
