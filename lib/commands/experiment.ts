import { experimentDefs } from '../data/experimentDefs'
import { submitExperimentEvent } from '../helper/submit'
import type { Core } from '../state/core'
import type { Experiment, ExperimentEvent } from '../state/types'
import {
  experimentEventAlreadySubmitted,
  getPreviewParticipation,
  getUserId,
  markExperimentAsSubmitted,
} from '../storage/storage'

// Experiment Cache for faster local lookup
type IndexEntry = { exp: Experiment; side: 'start' | 'end' }
const experimentIndex = new Map<string, IndexEntry[]>()

for (const exp of experimentDefs) {
  if (exp.endTs < Date.now()) continue // stale experiments
  addToIndex(formatEvent(exp.startEvent), { exp, side: 'start' })
  addToIndex(formatEvent(exp.endEvent), { exp, side: 'end' })
}

function addToIndex(key: string, entry: IndexEntry) {
  const bucket = experimentIndex.get(key)
  if (bucket) bucket.push(entry)
  else experimentIndex.set(key, [entry])
}
// END

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

export function formatEvent(ev: ExperimentEvent): string {
  let output = ev.key
  if ('id' in ev) {
    output += ':' + ev.id
  }
  return output
}

export function triggerEvent(core: Core, key: ExperimentEvent) {
  if (window.location.host.includes('localhost')) {
    console.log('event: ' + JSON.stringify(key))
  }

  if (core.ws.settings.lng !== 'de') return
  if (!getPreviewParticipation()) return

  const now = Date.now()
  const bucket = experimentIndex.get(formatEvent(key))
  if (!bucket) return
  for (const { exp, side } of bucket) {
    if (now < exp.startTs || now > exp.endTs) continue

    const group = getUserGroup(exp.id)
    const startKey = `${exp.id}-${group}-START`
    const endKey = `${exp.id}-${group}-END`

    if (side == 'start') {
      // just submit
      if (!experimentEventAlreadySubmitted(startKey)) {
        submitExperimentEvent(startKey)
      }
    } else {
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
