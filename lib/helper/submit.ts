import { Core } from '../state/core'

export function submit_event(event: string, core: Core) {
  if (core.state.enableStats) {
    if (!sessionStorage.getItem('robot_karol_online_tmp_id')) {
      sessionStorage.setItem(
        'robot_karol_online_tmp_id',
        Math.random().toString()
      )
    }

    const userId = sessionStorage.getItem('robot_karol_online_tmp_id')

    if (window.location.host == 'karol.arrrg.de') {
      // only log on production
      void (async () => {
        const rawResponse = await fetch('https://stats-karol.arrrg.de/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event, userId }),
        })
        //const content = await rawResponse.text()
        //console.log(content)
      })()
    }
  }
}
