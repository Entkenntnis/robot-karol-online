import { useEffect } from 'react'
import { flightdeckAccessKey } from '../../lib/storage/storage'
import { backend } from '../../backend'

export function Flightdeck() {
  useEffect(() => {
    ;(async () => {
      let key = localStorage.getItem(flightdeckAccessKey)
      while (key === null) {
        key = prompt('Zugangscode für das Flightdeck:')
        if (key) {
          localStorage.setItem(flightdeckAccessKey, key)
        }
      }
      alert('Das ist der Key:' + key)
      const resp1 = await fetch(backend.exportEndpoint + '/persistent_events', {
        headers: { Authorization: 'Bearer ' + key },
      })
      const persistent_data = await resp1.json()
      const resp2 = await fetch(backend.exportEndpoint + '/shares', {
        headers: { Authorization: 'Bearer ' + key },
      })
      const shares = await resp2.json()
      console.log(persistent_data)
      console.log(shares)

      // TODO: continue with loading data from server
      // ... /export/persistent_events
      // ... /export/shares
    })()
  }, [])
  return <div>Welcome to the Flightdeck.</div>
}
