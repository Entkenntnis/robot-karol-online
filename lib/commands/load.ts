import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { deserialize } from './json'

export async function loadProject(core: Core, id: string) {
  try {
    const res = await fetch(`https://stats-karol.arrrg.de/load/${id}`)
    const text = await res.text()
    deserialize(core, text)
    submit_event(`load_id_${id}`, core)
  } catch (e) {}
}
