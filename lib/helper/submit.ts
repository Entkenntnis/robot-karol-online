import { backend } from '../../backend'
import { Core } from '../state/core'

export const userIdKey = 'robot_karol_online_tmp_id'

export function submit_event(event: string, core: Core) {
  if (core.state.enableStats && backend.statsEndpoint) {
    if (
      !sessionStorage.getItem(userIdKey) &&
      !localStorage.getItem(userIdKey)
    ) {
      sessionStorage.setItem(userIdKey, Math.random().toString())
    }

    const userId =
      localStorage.getItem(userIdKey) ?? sessionStorage.getItem(userIdKey)

    if (window.location.host == 'karol.arrrg.de') {
      // only log on production
      void (async () => {
        await fetch(backend.statsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event, userId }),
        })
      })()
    }
  }
}
