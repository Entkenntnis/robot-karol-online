import { Core } from '../state/core'
import { World } from '../state/types'
import { endExecution } from './vm'

export function serialize(core: Core) {
  const { world, code } = core.ws
  return { world, code, mode: core.ws.settings.mode }
}

export function deserialize(core: Core, file?: string) {
  try {
    let {
      world,
      code,
      tabs,
      mode,
    }: {
      world: World
      code?: string
      tabs?: [string, string, string, string]
      mode?: Core['ws']['settings']['mode']
    } = JSON.parse(file ?? '{}')
    if (!world || (code === undefined && tabs === undefined)) {
      throw new Error('Datei unvollständig')
    }
    if (tabs) {
      code = tabs[0]
    }
    // minimal sanity check
    if (!world.dimX || !world.dimY || !world.height) {
      throw new Error('Welt beschädigt')
    }
    if (world.dimX > 100 || world.dimY > 100 || world.height > 10) {
      throw new Error('Welt ungültig')
    }
    for (let x = 0; x < world.dimX; x++) {
      for (let y = 0; y < world.dimY; y++) {
        if (
          typeof world.blocks[y][x] !== 'boolean' ||
          world.bricks[y][x] === undefined ||
          world.bricks[y][x] < 0 ||
          world.bricks[y][x] > world.height ||
          typeof world.marks[y][x] != 'boolean'
        ) {
          throw new Error('Welt enthält ungültigen Wert')
        }
      }
    }
    endExecution(core)
    core.mutateWs((state) => {
      state.code = code ?? ''
      if (mode) {
        state.settings.mode = mode
      }
      state.ui.needsTextRefresh = true
      state.ui.editorLoading = false
    })
    core.mutateCore((state) => {
      state.workspace.quest.tasks = [
        { start: world, title: 'Welt', target: null },
      ]
      state.workspace.quest.title = 'Importiertes Projekt'
      state.workspace.quest.description =
        'Dieses Projekt wurde aus einer früheren Version von Robot Karol importiert. Klicke auf die Welt und starte dein Programm.'
      state.workspace.ui.isImportedProject = true
    })
  } catch (e) {
    alert(e ?? 'Laden fehlgeschlagen')
  }
}

export function textRefreshDone(core: Core) {
  core.mutateWs((ws) => {
    ws.ui.needsTextRefresh = false
  })
}
