import { useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import { setupWorker } from '../../lib/commands/python'

export function PyodideWorker() {
  const core = useCore()

  useEffect(() => {
    if (!core.worker) {
      setupWorker(core)
    }
  }, [core])

  useEffect(() => {
    if (core.worker) {
      if (core.ws.settings.language == 'python-pro') {
        core.mutateWs(({ ui }) => {
          ui.state = 'loading'
        })
        core.worker.init()
      }
    }
  }, [core, core.worker, core.ws.settings.language])

  // add keyup and keydown event listeners to the window object
  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      core.mutateWs(({ ui }) => {
        const binding = ui.keybindings.find((el) => el.key === event.key)
        if (binding) {
          binding.pressed = false
        }
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      core.mutateWs(({ ui }) => {
        const binding = ui.keybindings.find((el) => el.key === event.key)
        if (binding) {
          binding.pressed = true
        }
      })
    }

    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [core])

  return null
}
