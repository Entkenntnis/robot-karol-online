import { backend } from '../../backend'
import { Core } from '../state/core'
import { serializeQuest } from './json'

export async function share(core: Core) {
  // TODO: rewrite this method
  const obj = serializeQuest(core)
  const json = JSON.stringify(obj)
  return await shareRequest(json)
}

async function shareRequest(content: string) {
  const rawResponse = await fetch(backend.questShareEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })
  const id = await rawResponse.text()
  if (!id || id.includes('not able')) {
    throw new Error('sharing failed')
  }
  return id
}
