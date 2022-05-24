import { Core } from '../state/core'
import { createWorld } from '../state/create'
import { Heading, World } from '../state/types'
import { addMessage } from './messages'

const readOnlyMessage = 'Deine Aufgabe ist abgeschlossen.'

export function forward(core: Core, opts?: { reverse: boolean }) {
  const { world } = core.ws
  const { karol, bricks } = world
  const dir = opts?.reverse ? reverse(karol.dir) : karol.dir
  const target = move(karol.x, karol.y, dir, world)

  if (!target) {
    addMessage(core, 'Karol kann sich nicht in diese Richtung bewegen.')
    return false
  }

  const currentBrickCount = bricks[karol.y][karol.x]
  const targetBrickCount = bricks[target.y][target.x]

  if (Math.abs(currentBrickCount - targetBrickCount) > 1) {
    addMessage(core, 'Karol kann diese Höhe nicht überwinden.')
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
    addMessage(core, 'Karol kann hier keinen Ziegel aufstellen.')
    return false
  }

  if (bricks[pos.y][pos.x] >= height) {
    addMessage(core, 'Maximale Stapelhöhe erreicht.')
    return false
  }

  if (isReadOnly(core, pos.x, pos.y)) {
    addMessage(core, readOnlyMessage)
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
    addMessage(core, 'Karol kann hier keine Ziegel aufheben.')
    return false
  }

  if (bricks[pos.y][pos.x] <= 0) {
    addMessage(core, 'Keine Ziegel zum Aufheben')
    return false
  }

  if (isReadOnly(core, pos.x, pos.y)) {
    addMessage(core, readOnlyMessage)
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
    addMessage(core, readOnlyMessage)
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
    addMessage(core, readOnlyMessage)
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
    addMessage(core, readOnlyMessage)
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
    addMessage(core, 'Karol kann hier keinen Quader aufstellen.')
    return false
  }

  if (isReadOnly(core, pos.x, pos.y)) {
    addMessage(core, readOnlyMessage)
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
      addMessage(core, 'Karol kann keinen Quader auf Ziegel stellen.')
      return false
    }
    if (marks[pos.y][pos.x]) {
      addMessage(core, 'Karol kann keinen Quader auf eine Marke stellen.')
      return false
    }
    core.mutateWs(({ world }) => {
      world.blocks[pos.y][pos.x] = true
    })
    onWorldChange(core)
    return true
  }
}

export function createWorldCmd(core: Core, x: number, y: number, z: number) {
  core.mutateWs((state) => {
    state.world = createWorld(x, y, z)
    state.ui.preview = undefined
  })
  core.mutateCore((core) => {
    core.projectTitle = undefined
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
  return core.ws.type == 'puzzle' && core.ws.progress == 100
}

function onWorldChange(core: Core) {
  if (core.ws.type == 'puzzle') {
    let correctFields = 0
    let nonEmptyFields = 0
    for (let x = 0; x < core.puzzle.targetWorld.dimX; x++) {
      for (let y = 0; y < core.puzzle.targetWorld.dimY; y++) {
        if (core.puzzle.targetWorld.bricks[y][x] > 0) {
          nonEmptyFields++
          if (
            core.ws.world.bricks[y][x] == core.puzzle.targetWorld.bricks[y][x]
          ) {
            correctFields++
          }
        } else {
          if (
            core.ws.world.bricks[y][x] !== core.puzzle.targetWorld.bricks[y][x]
          ) {
            correctFields--
          }
        }
      }
    }
    core.mutateWs((ws) => {
      if (ws.type == 'puzzle') {
        ws.progress = Math.round(
          (Math.max(0, correctFields) / nonEmptyFields) * 100
        )
        if (ws.progress == 100) {
          ws.ui.showPreview = false
        }
      }
    })
  }
}
