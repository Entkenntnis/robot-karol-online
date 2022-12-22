import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { deserialize } from './json'

export async function loadProject(core: Core) {
  const parameterList = new URLSearchParams(window.location.search)
  /*const file = parameterList.get('project')

  if (file) {
    try {
      const res = await fetch(file)
      const text = await res.text()
      const title = file.match(/\/([^\/]+\.json)/)
      if (title) {
        core.mutateCore((core) => {
          core.workspace.title = title[1]
        })
      }
      deserialize(core, text)
      core.mutateWs((ws) => {
        ws.ui.showPreview = false
        ws.settings.mode = 'code'
      })
    } catch (e) {}
  }*/

  const id = parameterList.get('id')

  if (id) {
    try {
      core.mutateWs((ws) => {
        ws.ui.editorLoading = true
        ws.ui.showQuestOverview = false
      })
      const res = await fetch(`https://stats-karol.arrrg.de/load/${id}`)
      const text = await res.text()
      deserialize(core, text)
      submit_event(`load_id_${id}`, core)
    } catch (e) {}
  }
}
