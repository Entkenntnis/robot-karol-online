import { Core } from '../state/core'
import { Quest, QuestSerialFormat, SerialWorld, World } from '../state/types'
import { endExecution } from './vm'

export function serializeQuest(core: Core): QuestSerialFormat {
  return {
    version: 'v1',
    title: core.ws.quest.title,
    description: core.ws.quest.description,
    tasks: core.ws.quest.tasks.map((task) => {
      return {
        title: task.title,
        start: serializeWorld(task.start),
        target: serializeWorld(task.target!),
      }
    }),
  }
}

export function serializeWorld(world: World): SerialWorld {
  const { dimX, dimY, height, blocks, bricks, karol, marks } = world

  return {
    dimX,
    dimY,
    height,
    karol,
    bricks: compressBricks(bricks),
    marks: compressMarks(marks),
    blocks: compressBlocks(blocks),
  }
}

function compressBricks(bricks: number[][]): SerialWorld['bricks'] {
  // TODO
  return {
    dimX: bricks[0].length,
    dimY: bricks.length,
    offsetX: 0,
    offsetY: 0,
    data: bricks,
  }
}

function compressBlocks(marks: boolean[][]): SerialWorld['marks'] {
  // TODO
  return {
    dimX: marks[0].length,
    dimY: marks.length,
    offsetX: 0,
    offsetY: 0,
    data: marks,
  }
}

function compressMarks(blocks: boolean[][]): SerialWorld['blocks'] {
  // TODO
  return {
    dimX: blocks[0].length,
    dimY: blocks.length,
    offsetX: 0,
    offsetY: 0,
    data: blocks,
  }
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

export function deserializeQuest(core: Core, quest: QuestSerialFormat) {
  core.mutateWs((ws) => {
    ws.quest.title = quest.title
    ws.quest.description = quest.description

    ws.quest.tasks = quest.tasks.map((task) => {
      return {
        title: task.title,
        start: deserializeWorld(task.start),
        target: deserializeWorld(task.target),
      }
    })

    ws.ui.needsTextRefresh = true
    ws.ui.editorLoading = false
  })
}

function deserializeWorld(world: SerialWorld): World {
  const { dimX, dimY, height, blocks, bricks, karol, marks } = world

  return {
    dimX,
    dimY,
    height,
    karol,
    bricks: decompressBricks(bricks),
    marks: decompressMarks(marks),
    blocks: decompressBlocks(blocks),
  }
}

function decompressBricks(bricks: SerialWorld['bricks']): number[][] {
  // TODO
  return bricks.data
}

function decompressBlocks(marks: SerialWorld['marks']): boolean[][] {
  // TODO
  return marks.data
}

function decompressMarks(blocks: SerialWorld['blocks']): boolean[][] {
  // TODO
  return blocks.data
}
