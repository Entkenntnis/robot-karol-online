/*import { Core } from '../state/core'
import { serialize } from './json'

export async function share(core: Core) {
  const json = serialize(core)
  const str = JSON.stringify(json)
  return await shareRequest(str)
}

async function shareRequest(content: string) {
  const rawResponse = await fetch('https://stats-karol.arrrg.de/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, title: '' }),
  })
  const id = await rawResponse.text()
  if (!id || id.length < 5) {
    throw new Error('sharing failed')
  }
  return id
}
*/

// need to reimplement this someday

export {}
