import { Core } from '../state/core'
import { createWorld } from '../state/create'
import { Heading, World } from '../state/types'
import { addMessage } from './messages'
import { endExecution } from './vm'

const readOnlyMessage = '---'

export function forward(core: Core, opts?: { reverse: boolean }) {
  const { world } = core.ws
  const { karol, bricks } = world
  const dir = opts?.reverse
    ? reverse(karol[core.ws.__activeRobot].dir)
    : karol[core.ws.__activeRobot].dir
  const target = move(
    karol[core.ws.__activeRobot].x,
    karol[core.ws.__activeRobot].y,
    dir,
    world
  )

  if (!target) {
    karolCrashed(core, core.strings.crash.invalidMove)
    return false
  }

  const currentBrickCount =
    bricks[karol[core.ws.__activeRobot].y][karol[core.ws.__activeRobot].x]
  const targetBrickCount = bricks[target.y][target.x]

  if (Math.abs(currentBrickCount - targetBrickCount) > 1) {
    karolCrashed(core, core.strings.crash.invalidHeight)
    return false
  }

  core.mutateWs(({ world }) => {
    world.karol[core.ws.__activeRobot].x = target.x
    world.karol[core.ws.__activeRobot].y = target.y
  })
  return true
}

export function left(core: Core) {
  core.mutateWs(({ world }) => {
    world.karol[core.ws.__activeRobot].dir = turnLeft(
      world.karol[core.ws.__activeRobot].dir
    )
  })
}

export function right(core: Core) {
  core.mutateWs(({ world }) => {
    world.karol[core.ws.__activeRobot].dir = turnRight(
      world.karol[core.ws.__activeRobot].dir
    )
  })
}

export function brick(core: Core) {
  const { world } = core.ws
  const { karol, bricks, height } = world
  const pos = move(
    karol[core.ws.__activeRobot].x,
    karol[core.ws.__activeRobot].y,
    karol[core.ws.__activeRobot].dir,
    world
  )

  if (!pos) {
    karolCrashed(core, core.strings.crash.invalidBrick)
    return false
  }

  /*if (bricks[pos.y][pos.x] >= height) {
    karolCrashed(core, core.strings.crash.maxHeight)
    return false
  }*/

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
  const pos = move(
    karol[core.ws.__activeRobot].x,
    karol[core.ws.__activeRobot].y,
    karol[core.ws.__activeRobot].dir,
    world
  )

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

  if (
    isReadOnly(
      core,
      karol[core.ws.__activeRobot].x,
      karol[core.ws.__activeRobot].y
    )
  ) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs(({ world }) => {
    world.marks[world.karol[core.ws.__activeRobot].y][
      world.karol[core.ws.__activeRobot].x
    ] =
      !world.marks[world.karol[core.ws.__activeRobot].y][
        world.karol[core.ws.__activeRobot].x
      ]
  })
  onWorldChange(core)
  return true
}

export function setMark(core: Core) {
  const { world } = core.ws
  const karol = world.karol

  if (
    isReadOnly(
      core,
      karol[core.ws.__activeRobot].x,
      karol[core.ws.__activeRobot].y
    )
  ) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs(({ world }) => {
    world.marks[world.karol[core.ws.__activeRobot].y][
      world.karol[core.ws.__activeRobot].x
    ] = true
  })
  onWorldChange(core)
  return true
}

export function resetMark(core: Core) {
  const { world } = core.ws
  const karol = world.karol

  if (
    isReadOnly(
      core,
      karol[core.ws.__activeRobot].x,
      karol[core.ws.__activeRobot].y
    )
  ) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  core.mutateWs(({ world }) => {
    world.marks[world.karol[core.ws.__activeRobot].y][
      world.karol[core.ws.__activeRobot].x
    ] = false
  })
  onWorldChange(core)
  return true
}

export function toggleBlock(core: Core) {
  const { world } = core.ws
  const { karol, blocks, bricks, marks } = world
  const pos = moveRaw(
    karol[core.ws.__activeRobot].x,
    karol[core.ws.__activeRobot].y,
    karol[core.ws.__activeRobot].dir,
    world
  )

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
  if (core.ws.canvas.manualControl) {
    return // ignore
  }
  if (core.ws.page == 'editor' && core.ws.ui.state !== 'running') {
    addMessage(core, error)
  } else {
    core.mutateWs(({ ui }) => {
      ui.karolCrashMessage = error
    })
    if (core.worker) {
      if (core.ws.ui.isBench) {
        core.mutateWs((ws) => {
          ws.bench.locked = false
        })
      } else {
        core.worker.reset()
      }
    }
    endExecution(core)
  }
}

export function onWorldChange(core: Core) {
  if (core.ws.quest.lastStartedTask === undefined) return
  const task = core.ws.quest.tasks[core.ws.quest.lastStartedTask]
  const target = task.target ? task.target : task.start

  if (core.ws.editor.editWorld !== null) return

  let correctFields = 0
  let nonEmptyFields = 0
  for (let x = 0; x < target.dimX; x++) {
    for (let y = 0; y < target.dimY; y++) {
      if (target.bricks[y][x] > 0) {
        nonEmptyFields++
        if (core.ws.world.bricks[y][x] == target.bricks[y][x]) {
          correctFields++
        }
      } else {
        if (core.ws.world.bricks[y][x] !== target.bricks[y][x]) {
          correctFields--
        }
      }
      if (target.marks[y][x]) {
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
}

export function twoWorldsEqual(world1: World, world2: World): boolean {
  if (
    world1.dimX !== world2.dimX ||
    world1.dimY !== world2.dimY ||
    world1.height !== world2.height
  ) {
    return false
  }
  for (let x = 0; x < world1.dimX; x++) {
    for (let y = 0; y < world1.dimY; y++) {
      if (
        world1.bricks[y][x] !== world2.bricks[y][x] ||
        world1.marks[y][x] !== world2.marks[y][x] ||
        world1.blocks[y][x] !== world2.blocks[y][x]
      ) {
        return false
      }
    }
  }
  return true
}
