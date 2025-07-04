import { robotKarol2Python } from '../language/python/robotKarol2Python'
import { Core } from '../state/core'
import {
  Compressed2D_MUST_STAY_COMPATIBLE,
  Quest,
  QuestData,
  QuestSerialFormat_MUST_STAY_COMPATIBLE,
  SerialWorld_MUST_STAY_COMPATIBLE,
  World,
} from '../state/types'
import { setLanguage } from './language'
import { setMode } from './mode'
import {
  attemptToLoadProgramFromLocalStorage,
  getProgram,
  loadProgram,
} from './save'
import { endExecution } from './vm'
import { twoWorldsEqual } from './world'

export function serializeQuest(
  core: Core
): QuestSerialFormat_MUST_STAY_COMPATIBLE {
  const output: QuestSerialFormat_MUST_STAY_COMPATIBLE = {
    version: 'v1',
    title: core.ws.quest.title,
    description: core.ws.quest.description,
    tasks: core.ws.ui.isChatMode
      ? []
      : core.ws.quest.tasks.map((task) => {
          return {
            title: task.title,
            start: serializeWorld(task.start),
            target: serializeWorld(task.target ?? task.start),
          }
        }),
    lng: core.ws.settings.lng,
    editOptions:
      core.ws.editor.editOptions === 'all'
        ? undefined
        : core.ws.editor.editOptions,
    questScript: core.ws.editor.questScript,
    chats: core.ws.ui.isChatMode ? core.ws.quest.chats : undefined,
  }

  if (core.ws.editor.saveProgram) {
    const editorState = getProgram(core)
    output.language = editorState.language as any //
    output.program = editorState.program
  }

  return output
}

export function serializeWorld(world: World): SerialWorld_MUST_STAY_COMPATIBLE {
  const { dimX, dimY, height, blocks, bricks, karol, marks } = world

  return {
    dimX,
    dimY,
    height,
    karol: karol[0],
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
    // @ts-ignore Compatibility with old worlds
    world.karol = [world.karol]
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

export function deserializeQuest(
  core: Core,
  quest: QuestSerialFormat_MUST_STAY_COMPATIBLE,
  updateLng: boolean = true
) {
  // set title of window to quest title
  document.title = quest.title

  core.mutateWs((ws) => {
    ws.quest.title = quest.title
    ws.quest.description = quest.description
    ws.ui.isChatMode = false // adapt if chat mode quests are coming in
    ws.ui.lockLanguage = undefined

    ws.quest.tasks = quest.tasks.map((task) => {
      const start = deserializeWorld(task.start)
      const target = deserializeWorld(task.target)
      const noTarget = twoWorldsEqual(start, target) && ws.page !== 'editor'
      return {
        title: task.title,
        start,
        target: noTarget ? null : target,
      }
    })

    ws.ui.needsTextRefresh = true

    if (updateLng) {
      if (quest.lng === 'en') {
        ws.settings.lng = 'en'
      } else {
        ws.settings.lng = 'de'
      }
    }

    if (quest.questScript) {
      ws.editor.questScript = quest.questScript
    }

    if (quest.chats) {
      ws.ui.isChatMode = true
      ws.quest.chats = quest.chats
      ws.ui.lockLanguage = 'python-pro'
    }
  })

  if ((quest.program || quest.chats) && quest.language) {
    loadProgram(core, quest.program || '', quest.language)
  }
  attemptToLoadProgramFromLocalStorage(core)
  if (core.ws.page === 'editor') {
    core.mutateWs((ws) => {
      ws.editor.editOptions =
        quest.editOptions == 'python-only'
          ? 'python-pro-only'
          : quest.editOptions
          ? quest.editOptions
          : 'all'
      ws.editor.saveProgram = !!(quest.program && quest.language)
    })
  } else if (quest.editOptions) {
    if (quest.editOptions === 'python-only') {
      setLanguage(core, 'python-pro')
      core.mutateWs((ws) => {
        ws.ui.lockLanguage = 'python-pro'
        ws.settings.mode = 'code'
      })
    }
    if (quest.editOptions === 'python-pro-only') {
      setLanguage(core, 'python-pro')
      core.mutateWs((ws) => {
        ws.ui.lockLanguage = 'python-pro'
        ws.settings.mode = 'code'
      })
    }
    if (quest.editOptions === 'java-only') {
      setLanguage(core, 'java')
      core.mutateWs((ws) => {
        ws.ui.lockLanguage = 'java'
        ws.settings.mode = 'code'
      })
    }
    if (quest.editOptions === 'karol-only') {
      setLanguage(core, 'robot karol')
      core.mutateWs((ws) => {
        ws.ui.lockLanguage = 'karol'
        ws.settings.mode = 'code'
      })
    }
  }
}

export function deserializeQuestToData(
  quest: QuestSerialFormat_MUST_STAY_COMPATIBLE
): QuestData {
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
    script: quest.questScript
      ? {
          program: quest.program ?? robotKarol2Python(''),
          questScript: quest.questScript,
        }
      : quest.editOptions == 'python-pro-only' ||
        quest.editOptions == 'python-only'
      ? {
          program: quest.program ?? robotKarol2Python(''),
          questScript: '',
        }
      : undefined,
  }
}

export function deserializeWorld(
  world: SerialWorld_MUST_STAY_COMPATIBLE
): World {
  const { dimX, dimY, height, blocks, bricks, karol, marks } = world

  return {
    dimX,
    dimY,
    height,
    karol: [karol],
    bricks: decompress2dArray(bricks, dimX, dimY, 0),
    marks: decompress2dArray(marks, dimX, dimY, false),
    blocks: decompress2dArray(blocks, dimX, dimY, false),
  }
}

function compress2dArray<T>(
  input: T[][],
  defaultVal: T
): Compressed2D_MUST_STAY_COMPATIBLE<T> {
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
  input: Compressed2D_MUST_STAY_COMPATIBLE<T>,
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
