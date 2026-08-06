import { experimentDefs } from '../data/experimentDefs'
import { submitExperimentEvent } from '../helper/submit'
import type { Core } from '../state/core'
import {
  experimentEventAlreadySubmitted,
  getPreviewParticipation,
  getUserId,
  markExperimentAsSubmitted,
} from '../storage/storage'

function getUserGroup(id: number) {
  const key = `experiment-${id}-for-user-${getUserId()}`
  return fnv1a(key) % 2 == 0 ? 'C' : 'T'
}

// AI generated, looks correct though
function fnv1a(str: string): number {
  let hash = 0x811c9dc5 // 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return hash >>> 0 // unsigned 32-bit
}

export function triggerEvent(core: Core, key: string) {
  console.log('event: ' + key)

  if (core.ws.settings.lng !== 'de') return
  if (!getPreviewParticipation()) return

  const now = Date.now()
  const relevant = experimentDefs.filter(
    (exp) =>
      now >= exp.startTs &&
      now <= exp.endTs &&
      (exp.startEvent == key || exp.endEvent == key),
  )
  if (relevant.length == 0) return

  for (const exp of relevant) {
    const group = getUserGroup(exp.id)
    const startKey = `${exp.id}-${group}-START`
    const endKey = `${exp.id}-${group}-END`

    if (exp.startEvent == key) {
      // just submit
      if (!experimentEventAlreadySubmitted(startKey)) {
        submitExperimentEvent(startKey)
      }
    }
    if (exp.endEvent == key) {
      // check for invalid user
      if (!experimentEventAlreadySubmitted(startKey)) {
        // oh, bad, this user is out
        markExperimentAsSubmitted(startKey)
        markExperimentAsSubmitted(endKey)
      } else {
        // so, start key was already submitted, now gates end key
        if (!experimentEventAlreadySubmitted(endKey)) {
          submitExperimentEvent(endKey)
        }
      }
    }
  }
}

export function showExperiment(core: Core, id: number) {
  const exp = experimentDefs.find((e) => e.id == id)
  if (!exp) return false
  if (core.ws.settings.lng !== 'de') return false
  if (!getPreviewParticipation()) return false

  const now = Date.now()
  if (now < exp.startTs || now > exp.endTs) return false

  return getUserGroup(exp.id) == 'T'
}
