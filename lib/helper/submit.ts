import { backend } from '../../backend'
import { Core } from '../state/core'

export function ____submit_event(_event: string, _core: Core) {
  // no_op placeholder
}

export function ____submitAnalyzeEvent(core: Core, key: string) {
  ____submit_event(key, core)
}

export function submitEvent(key: string, value: string) {
  if (backend.eventEndpoint) {
    // only log on production or to local server
    if (
      window.location.host !== 'karol.arrrg.de' &&
      !backend.eventEndpoint.includes('localhost')
    ) {
      return
    }

    void (async () => {
      const maxAttempts = 5

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await fetch(backend.eventEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, value }),
          })

          if (response.ok) {
            // Erfolg (2xx) – beende die Wiederholung
            return
          }
        } catch (error) {}

        // Vor dem nächsten Versuch kurz warten (ausser beim letzten)
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    })()
  }
}

// export function submitEvent(key: string, value: string) {
//   if (backend.eventEndpoint) {
//     // only log on production or to local server
//     if (
//       window.location.host !== 'karol.arrrg.de' &&
//       !backend.eventEndpoint.includes('localhost')
//     ) {
//       // console.log('debug:submit_event', event)
//       return
//     }
//     void (async () => {
//       await fetch(backend.eventEndpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ key, value }),
//       })
//     })()
//   }
// }
