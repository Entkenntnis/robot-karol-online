import { backend } from '../../backend'
import { Core } from '../state/core'
import { submitExperimentEventOnce } from '../storage/storage'
import { superfetch } from './superfetch'
import { nanoid } from 'nanoid'

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

    superfetch(backend.eventEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    })
  }
}

export function submitExperimentEvent(key: string) {
  if (backend.experimentEndpoint) {
    if (
      window.location.host !== 'karol.arrrg.de' &&
      !backend.experimentEndpoint.includes('localhost')
    ) {
      return
    }
    if (!submitExperimentEventOnce(key)) {
      return
    }
    superfetch(backend.experimentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, id: nanoid() }),
    })
  }
}
