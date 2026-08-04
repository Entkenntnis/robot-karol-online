import { backend } from '../../backend'
import { ____submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { ____submitAnalyzeEvent } from '../helper/submit'
import { serializeQuest } from './json'
import { superfetch } from '../helper/superfetch'

export async function share(core: Core) {
  // TODO: rewrite this method
  const obj = serializeQuest(core)
  const json = JSON.stringify(obj)
  const id = await shareRequest(json)
  ____submit_event(`publish_custom_quest_${id}`, core)
  if (obj.editOptions) {
    ____submitAnalyzeEvent(core, `ev_event_limitEditOptions-${obj.editOptions}`)
  }
  return id
}

async function shareRequest(content: string) {
  const rawResponse = await superfetch(backend.questShareEndpoint, {
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
