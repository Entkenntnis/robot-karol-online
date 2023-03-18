import { backend } from '../../backend'
import { Core } from '../state/core'

export function submitSolution(core: Core, questId: number, solution: string) {
  if (core.state.enableStats && backend.solutionEndpoint) {
    // only log on production
    if (window.location.host !== 'karol.arrrg.de') return

    void (async () => {
      await fetch(backend.solutionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questId, solution }),
      })
    })()
  }
}
