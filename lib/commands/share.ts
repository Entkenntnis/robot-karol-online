import { backend } from '../../backend'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { serializeQuest } from './json'

export async function share(core: Core) {
  // TODO: rewrite this method
  const obj = serializeQuest(core)
  const json = JSON.stringify(obj)
  const id = await shareRequest(json)
  submit_event(`publish_custom_quest_${id}`, core)
  if (obj.editOptions) {
    submit_event('limit_edit_options', core)
  }
  return id
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
