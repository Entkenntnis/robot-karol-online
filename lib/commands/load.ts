import { backend } from '../../backend'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { QuestSerialFormat } from '../state/types'
import { deserialize, deserializeQuest } from './json'

export async function loadLegacyProject(core: Core, id: string) {
  try {
    const res = await fetch(`${backend.legacyEndpoint}/${id}`)
    const text = await res.text()
    deserialize(core, text)
    submit_event(`load_id_${id}`, core)
  } catch (e) {}
}

export async function loadQuest(core: Core, id: string) {
  try {
    const res = await fetch(`${backend.questEndpoint}/${id}`)
    const text = await res.text()
    const obj = JSON.parse(text ?? '{}') as QuestSerialFormat
    if (obj.version !== 'v1') {
      throw 'bad format'
    }
    core.mutateWs(({ ui }) => {
      ui.sharedQuestId = id
      if (obj.language && obj.program) {
        ui.resetCode[id] = [obj.language, obj.program]
      } else {
        ui.resetCode[id] = ['blocks', '']
      }
    })
    deserializeQuest(core, obj)
    submit_event(`load_custom_quest_${id}`, core)
  } catch (e) {
    alert('Unbekannte Aufgabe')
    submit_event(`unknown_quest_${id}`, core)
    window.location.href = '/'
  }
}
