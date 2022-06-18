import { Core } from '../state/core'
import { deserialize } from './json'

export async function loadProject(core: Core) {
  const parameterList = new URLSearchParams(window.location.search)
  const file = parameterList.get('project')

  if (file) {
    try {
      const res = await fetch(file)
      const text = await res.text()
      const title = file.match(/\/([^\/]+\.json)/)
      if (title) {
        core.mutateCore((core) => {
          core.projectTitle = title[1]
        })
      }
      deserialize(core, text)
      core.mutateWs((ws) => {
        if (ws.type == 'free') ws.ui.showPreview = false
        ws.settings.mode = 'code'
      })
    } catch (e) {}
  }

  const id = parameterList.get('id')

  if (id) {
    try {
      const res = await fetch(`https://stats-karol.arrrg.de/load/${id}`)
      const text = await res.text()
      deserialize(core, text)
      core.mutateWs((ws) => {
        if (ws.type == 'free') ws.ui.showPreview = false
        ws.settings.mode = 'code'
      })
    } catch (e) {}
  }
}

export function restoreProject(core: Core) {
  core.mutateWs((ws) => {
    if (core.state.projectInitialWorld) {
      ws.world = core.state.projectInitialWorld
    }
  })
}
