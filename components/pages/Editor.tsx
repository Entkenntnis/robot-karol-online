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
  }, [])
  return <IdeMain />
}
