import { Core } from '../state/core'
import { createWorld } from '../state/create'
import { Heading, World } from '../state/types'
import { addMessage } from './messages'
import { endExecution } from './vm'

const readOnlyMessage = '---'

export function forward(core: Core, opts?: { reverse: boolean }) {
  const { world } = core.ws
  const { karol, bricks } = world
  const dir = opts?.reverse ? reverse(karol.dir) : karol.dir
  const target = move(karol.x, karol.y, dir, world)

  if (!target) {
    karolCrashed(core, core.strings.crash.invalidMove)
    return false
  }

  const currentBrickCount = bricks[karol.y][karol.x]
  const targetBrickCount = bricks[target.y][target.x]

  if (Math.abs(currentBrickCount - targetBrickCount) > 1) {
    karolCrashed(core, core.strings.crash.invalidHeight)
    return false
  }

  core.mutateWs(({ world }) => {
    world.karol.x = target.x
    world.karol.y = target.y
  })
  return true
}

export function left(core: Core) {
  core.mutateWs(({ world }) => {
    world.karol.dir = turnLeft(world.karol.dir)
  })
}

export function right(core: Core) {
  core.mutateWs(({ world }) => {
    world.karol.dir = turnRight(world.karol.dir)
  })
}

export function brick(core: Core) {
  const { world } = core.ws
  const { karol, bricks, height } = world
  const pos = move(karol.x, karol.y, karol.dir, world)

  if (!pos) {
    karolCrashed(core, core.strings.crash.invalidBrick)
    return false
  }

  if (bricks[pos.y][pos.x] >= height) {
    karolCrashed(core, core.strings.crash.maxHeight)
    return false
  }

  if (isReadOnly(core, pos.x, pos.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs((state) => {
    state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] + 1
  })
  onWorldChange(core)
  return true
}

export function unbrick(core: Core) {
  const { world } = core.ws
  const { karol, bricks } = world
  const pos = move(karol.x, karol.y, karol.dir, world)

  if (!pos) {
    karolCrashed(core, core.strings.crash.invalidPick)
    return false
  }

  if (bricks[pos.y][pos.x] <= 0) {
    karolCrashed(core, core.strings.crash.noBricks)
    return false
  }

  if (isReadOnly(core, pos.x, pos.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs((state) => {
    state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] - 1
  })
  onWorldChange(core)
  return true
}

export function toggleMark(core: Core) {
  const karol = core.ws.world.karol

  if (isReadOnly(core, karol.x, karol.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] =
      !world.marks[world.karol.y][world.karol.x]
  })
  onWorldChange(core)
  return true
}

export function setMark(core: Core) {
  const { world } = core.ws
  const karol = world.karol

  if (isReadOnly(core, karol.x, karol.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] = true
  })
  onWorldChange(core)
  return true
}

export function resetMark(core: Core) {
  const { world } = core.ws
  const karol = world.karol

  if (isReadOnly(core, karol.x, karol.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] = false
  })
  onWorldChange(core)
  return true
}

export function toggleBlock(core: Core) {
  const { world } = core.ws
  const { karol, blocks, bricks, marks } = world
  const pos = moveRaw(karol.x, karol.y, karol.dir, world)

  if (!pos) {
    karolCrashed(core, core.strings.crash.invalidBlock)
    return false
  }

  if (isReadOnly(core, pos.x, pos.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  if (blocks[pos.y][pos.x]) {
    core.mutateWs(({ world }) => {
      world.blocks[pos.y][pos.x] = false
    })
    onWorldChange(core)
    return true
  } else {
    if (bricks[pos.y][pos.x] > 0) {
      karolCrashed(core, core.strings.crash.noBlockOnBrick)
      return false
    }
    if (marks[pos.y][pos.x]) {
      karolCrashed(core, core.strings.crash.noBlockOnMark)
      return false
    }
    core.mutateWs(({ world }) => {
      world.blocks[pos.y][pos.x] = true
    })
    onWorldChange(core)
    return true
  }
}

export function createWorldCmd(
  core: Core,
  x: number,
  y: number,
  z: number,
  keep?: boolean
) {
  const previous = core.ws.world
  core.mutateWs((state) => {
    state.world = createWorld(x, y, z)
    // copy existing state
    if (keep) {
      for (let x2 = 0; x2 < x; x2++) {
        for (let y2 = 0; y2 < y; y2++) {
          if (x2 < previous.dimX && y2 < previous.dimY) {
            state.world.marks[y2][x2] = previous.marks[y2][x2]
            state.world.bricks[y2][x2] = previous.bricks[y2][x2]
            state.world.blocks[y2][x2] = previous.blocks[y2][x2]
          }
        }
      }
      state.world.karol = previous.karol
    }
  })
}

export function move(x: number, y: number, dir: Heading, world: World) {
  const pos = moveRaw(x, y, dir, world)
  if (pos && !world.blocks[pos.y][pos.x]) {
    return pos
  }
}

export function moveRaw(x: number, y: number, dir: Heading, world: World) {
  if (dir == 'east') {
    if (x + 1 < world.dimX) {
      return { x: x + 1, y }
    }
  }
  if (dir == 'west') {
    if (x > 0) {
      return { x: x - 1, y }
    }
  }
  if (dir == 'south') {
    if (y + 1 < world.dimY) {
      return { x, y: y + 1 }
    }
  }
  if (dir == 'north') {
    if (y > 0) {
      return { x, y: y - 1 }
    }
  }
}

export function reverse(h: Heading) {
  return { north: 'south', south: 'north', east: 'west', west: 'east' }[
    h
  ] as Heading
}

export function turnLeft(h: Heading) {
  return {
    north: 'west',
    west: 'south',
    south: 'east',
    east: 'north',
  }[h] as Heading
}

export function turnRight(h: Heading) {
  return {
    north: 'east',
    east: 'south',
    south: 'west',
    west: 'north',
  }[h] as Heading
}

function isReadOnly(core: Core, x: number, y: number) {
  return false
}
function karolCrashed(core: Core, error: string) {
  if (core.ws.page == 'editor' && core.ws.ui.state !== 'running') {
    addMessage(core, error)
  } else {
    core.mutateWs(({ ui }) => {
      ui.karolCrashMessage = error
    })
    endExecution(core)
  }
}

export function onWorldChange(core: Core) {
  if (core.ws.quest.lastStartedTask === undefined) return
  const task = core.ws.quest.tasks[core.ws.quest.lastStartedTask]
  if (task.target === null) return

  if (core.ws.editor.editWorld !== null) return

  let correctFields = 0
  let nonEmptyFields = 0
  for (let x = 0; x < task.target.dimX; x++) {
    for (let y = 0; y < task.target.dimY; y++) {
      if (task.target.bricks[y][x] > 0) {
        nonEmptyFields++
        if (core.ws.world.bricks[y][x] == task.target.bricks[y][x]) {
          correctFields++
        }
      } else {
        if (core.ws.world.bricks[y][x] !== task.target.bricks[y][x]) {
          correctFields--
        }
      }
      if (task.target.marks[y][x]) {
        nonEmptyFields++
        if (core.ws.world.marks[y][x]) {
          correctFields++
        }
      } else {
        if (core.ws.world.marks[y][x]) {
          correctFields--
        }
      }
    }
  }

  let progress = Math.round((Math.max(0, correctFields) / nonEmptyFields) * 100)

  if (nonEmptyFields == 0 && correctFields == 0) {
    progress = 100
  } else if (nonEmptyFields == 0) {
    progress = 0
  }

  core.mutateWs((ws) => {
    ws.quest.progress = progress == 100
  })

  /*const id = core.ws.id
  if (progress == 100 && !core.state.done.includes(id)) {
    core.mutateCore((state) => {
      state.done.push(id)
    })
    submit_event(`${id}_done`, core)
  }

  if (progress == 100) {
    core.deleteWsFromStorage(id)
  }*/
}
