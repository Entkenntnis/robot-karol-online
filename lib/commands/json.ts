import { Core } from '../state/core'
import {
  Compressed2D,
  Quest,
  QuestData,
  QuestSerialFormat,
  SerialWorld,
  World,
} from '../state/types'
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
    bricks: compress2dArray(bricks, 0),
    marks: compress2dArray(marks, false),
    blocks: compress2dArray(blocks, false),
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
  })
}

export function deserlizeQuestToData(quest: QuestSerialFormat): QuestData {
  return {
    title: quest.title,
    description: quest.description,
    difficulty: '',
    tasks: quest.tasks.map((task) => {
      return {
        title: task.title,
        start: deserializeWorld(task.start),
        target: deserializeWorld(task.target),
      }
    }),
  }
}

function deserializeWorld(world: SerialWorld): World {
  const { dimX, dimY, height, blocks, bricks, karol, marks } = world

  return {
    dimX,
    dimY,
    height,
    karol,
    bricks: decompress2dArray(bricks, dimX, dimY, 0),
    marks: decompress2dArray(marks, dimX, dimY, false),
    blocks: decompress2dArray(blocks, dimX, dimY, false),
  }
}

function compress2dArray<T>(input: T[][], defaultVal: T): Compressed2D<T> {
  const dimX = input[0].length
  const dimY = input.length

  const colStatus = Array.from(Array(dimX), (_, i) => i).map((x) =>
    Array.from(Array(dimY), (_, i) => i).some((y) => input[y][x] !== defaultVal)
  )

  const rowStatus = Array.from(Array(dimY), (_, i) => i).map((y) =>
    Array.from(Array(dimX), (_, i) => i).some((x) => input[y][x] !== defaultVal)
  )

  let offsetX = -1
  let offsetY = -1
  let dataX = 0
  let dataY = 0

  if (colStatus.every((x) => !x)) {
    // empty
    return { offsetX, offsetY, dimX: 0, dimY: 0, data: [] }
  }

  for (let i = 0; i < dimX; i++) {
    if (colStatus[i]) {
      if (offsetX == -1) {
        offsetX = i // start of closure
      }
      dataX = i - offsetX + 1
    }
  }

  for (let i = 0; i < dimY; i++) {
    if (rowStatus[i]) {
      if (offsetY == -1) {
        offsetY = i // start of closure
      }
      dataY = i - offsetY + 1
    }
  }

  const data = Array(dataY)
    .fill(defaultVal)
    .map(() => Array(dataX).fill(defaultVal))

  for (let x = 0; x < dataX; x++) {
    for (let y = 0; y < dataY; y++) {
      data[y][x] = input[y + offsetY][x + offsetX]
    }
  }

  return {
    dimX: dataX,
    dimY: dataY,
    offsetX,
    offsetY,
    data,
  }
}

function decompress2dArray<T>(
  input: Compressed2D<T>,
  dimX: number,
  dimY: number,
  defaultVal: T
): T[][] {
  const data = Array(dimY)
    .fill(defaultVal)
    .map(() => Array(dimX).fill(defaultVal))

  for (let x = 0; x < input.dimX; x++) {
    for (let y = 0; y < input.dimY; y++) {
      data[y + input.offsetY][x + input.offsetX] = input.data[y][x]
    }
  }

  return data
}
