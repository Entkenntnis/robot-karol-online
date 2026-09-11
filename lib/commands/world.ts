import { Core } from '../state/core'
import { createWorld } from '../state/create'
import type { Heading, World } from '../state/types'
import { getRobot, mutateRobot } from '../robot/robots'
import { addMessage } from './messages'
import { endExecution } from './vm'

const readOnlyMessage = '---'

export function forward(
  core: Core,
  robotId: string,
  opts?: { reverse: boolean },
) {
  const { world } = core.ws
  const { bricks } = world
  const karol = getRobot(world, robotId)
  const dir = opts?.reverse ? reverse(karol.dir) : karol.dir
  const target = move(karol.x, karol.y, dir, world)

  if (!target) {
    karolCrashed(core, core.ttung('Aua! Karol ist gegen eine Wand gelaufen.'))
    return false
  }

  const currentBrickCount = bricks[karol.y][karol.x]
  const targetBrickCount = bricks[target.y][target.x]

  if (Math.abs(currentBrickCount - targetBrickCount) > 1) {
    karolCrashed(core, core.ttung('Karol kann diese Höhe nicht überwinden.'))
    return false
  }

  mutateRobot(core, robotId, (robot) => {
    robot.x = target.x
    robot.y = target.y
  })
  return true
}

export function left(core: Core, robotId: string) {
  mutateRobot(core, robotId, (robot) => {
    robot.dir = turnLeft(robot.dir)
  })
}

export function right(core: Core, robotId: string) {
  mutateRobot(core, robotId, (robot) => {
    robot.dir = turnRight(robot.dir)
  })
}

export function brick(core: Core, robotId: string) {
  const { world } = core.ws
  const karol = getRobot(world, robotId)
  const pos = move(karol.x, karol.y, karol.dir, world)

  if (!pos) {
    karolCrashed(core, core.ttung('Karol kann hier keinen Ziegel aufstellen.'))
    return false
  }

  /*if (bricks[pos.y][pos.x] >= height) {
    karolCrashed(core, core.ttung('Maximale Stapelhöhe erreicht.'))
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

export function unbrick(core: Core, robotId: string) {
  const { world } = core.ws
  const { bricks } = world
  const karol = getRobot(world, robotId)
  const pos = move(karol.x, karol.y, karol.dir, world)

  if (!pos) {
    karolCrashed(core, core.ttung('Karol kann hier keine Ziegel aufheben.'))
    return false
  }

  if (bricks[pos.y][pos.x] <= 0) {
    karolCrashed(core, core.ttung('Keine Ziegel zum Aufheben'))
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

export function toggleMark(core: Core, robotId: string) {
  const karol = getRobot(core.ws.world, robotId)

  if (isReadOnly(core, karol.x, karol.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  mutateRobot(core, robotId, (robot, world) => {
    world.marks[robot.y][robot.x] = !world.marks[robot.y][robot.x]
  })
  onWorldChange(core)
  return true
}

export function setMark(core: Core, robotId: string) {
  const { world } = core.ws
  const karol = getRobot(world, robotId)

  if (isReadOnly(core, karol.x, karol.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  mutateRobot(core, robotId, (robot, world) => {
    world.marks[robot.y][robot.x] = true
  })
  onWorldChange(core)
  return true
}

export function resetMark(core: Core, robotId: string) {
  const { world } = core.ws
  const karol = getRobot(world, robotId)

  if (isReadOnly(core, karol.x, karol.y)) {
    karolCrashed(core, readOnlyMessage)
    return false
  }

  mutateRobot(core, robotId, (robot, world) => {
    world.marks[robot.y][robot.x] = false
  })
  onWorldChange(core)
  return true
}

export function toggleBlock(core: Core, robotId: string) {
  const { world } = core.ws
  const { blocks, bricks, marks } = world
  const karol = getRobot(world, robotId)
  const pos = moveRaw(karol.x, karol.y, karol.dir, world)

  if (!pos) {
    karolCrashed(core, core.ttung('Karol kann hier keinen Quader aufstellen.'))
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
      karolCrashed(
        core,
        core.ttung('Karol kann keinen Quader auf Ziegel stellen.'),
      )
      return false
    }
    if (marks[pos.y][pos.x]) {
      karolCrashed(
        core,
        core.ttung('Karol kann keinen Quader auf eine Marke stellen.'),
      )
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
  keep?: boolean,
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
      state.world.robots = previous.robots
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
  return (
    { north: 'south', south: 'north', east: 'west', west: 'east' } as const
  )[h]
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

function isReadOnly(_: Core, __: number, ___: number) {
  return false
}
function karolCrashed(core: Core, error: string) {
  if (core.ws.canvas.manualControl) {
    return // ignore
  }
  if (
    (core.ws.page == 'editor' || core.ws.page == 'spielwiese') &&
    core.ws.ui.state !== 'running'
  ) {
    addMessage(core, error)
  } else {
    core.mutateWs(({ ui }) => {
      ui.karolCrashMessage = error
    })
    if (core.worker) {
      core.worker.reset()
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
