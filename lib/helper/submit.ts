import { backend } from '../../backend'
import { Core } from '../state/core'

export function submit_event(event: string, core: Core) {
  if (core.state.enableStats && backend.statsEndpoint) {
    const userId = getUserId()

    // only log on production or to local server
    if (
      window.location.host !== 'karol.arrrg.de' &&
      window.location.host !== 'karol-neu.arrrg.de' &&
      !backend.statsEndpoint.includes('localhost')
    ) {
      // console.log('debug:submit_event', event)
      return
    }

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

export function submitAnalyzeEvent(core: Core, key: string) {
  submit_event(key, core)
}

// This is a nasty circular dependency, and to avoid this, I'm duplicating the code
// (shame on me)
// But I need to think about it a bit more, as it's really not good to have so many
// circles
// import { getUserId } from '../storage/storage'

const userIdKey = 'robot_karol_online_tmp_id'
function getUserId() {
  if (!sessionStorage.getItem(userIdKey) && !localStorage.getItem(userIdKey)) {
    sessionStorage.setItem(userIdKey, Math.random().toString())
  }

  return localStorage.getItem(userIdKey) ?? sessionStorage.getItem(userIdKey)
}
