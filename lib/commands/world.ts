import { chips } from '../data/chips'
import { levels } from '../data/levels'
import { Core } from '../state/core'
import { createWorld } from '../state/create'
import { Heading, World } from '../state/types'
import { submit_event } from '../stats/submit'
import { addMessage } from './messages'
import { createSparkle } from './sparkle'

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
    addMessage(core, 'Dieses Feld kann nicht verändert werden.')
    return false
  }

  core.mutateWs((state) => {
    state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] + 1
  })
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
    addMessage(core, 'Dieses Feld kann nicht verändert werden.')
    return false
  }

  core.mutateWs((state) => {
    state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] - 1
  })
  return true
}

export function toggleMark(core: Core) {
  const karol = core.ws.world.karol

  if (isReadOnly(core, karol.x, karol.y)) {
    addMessage(core, 'Dieses Feld kann nicht verändert werden.')
    return false
  }

  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] =
      !world.marks[world.karol.y][world.karol.x]
  })
  checkChipActive(core)
  return true
}

export function setMark(core: Core) {
  const { world } = core.ws
  const karol = world.karol

  if (isReadOnly(core, karol.x, karol.y)) {
    addMessage(core, 'Dieses Feld kann nicht verändert werden.')
    return false
  }

  const previousMark = world.marks[world.karol.y][world.karol.x]

  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] = true
  })
  if (!previousMark) checkChipActive(core)
  return true
}

export function resetMark(core: Core) {
  const { world } = core.ws
  const karol = world.karol

  if (isReadOnly(core, karol.x, karol.y)) {
    addMessage(core, 'Dieses Feld kann nicht verändert werden.')
    return false
  }

  const previousMark = world.marks[world.karol.y][world.karol.x]

  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] = false
  })
  if (previousMark) checkChipActive(core)
  return true
}

function checkChipActive(core: Core) {
  for (const chip of core.ws.world.chips) {
    //chips[chip.tag].checkAction(core, chip)
    const chipDef = chips[chip.tag]
    const world = core.ws.world
    const { karol } = world
    if (
      karol.x == chip.x + chipDef.checkpointX &&
      karol.y == chip.y + chipDef.checkpointY
    ) {
      if (world.marks[karol.y][karol.x]) {
        if (chipDef.checkAction(core, chip)) {
          core.mutateLevel((state) => {
            state.progress++
          })
          if (core.level!.progress == levels[core.level!.levelId].target) {
            submit_event(
              `finish_${levels[core.level!.levelId].title.toLowerCase()}`,
              core
            )
          }
          createSparkle(core, chipDef.sparkleX, chipDef.sparkleY, 'happy')
        } else {
          if (core.level!.progress < levels[core.level!.levelId].target) {
            addMessage(core, 'Falsche Belegung! Fortschritt zurückgesetzt.')
            core.mutateLevel((state) => {
              state.progress = 0
            })
            core.mutateWs(({ world }) => {
              world.marks[karol.y][karol.x] = false
            })
            createSparkle(core, chipDef.sparkleX, chipDef.sparkleY, 'fail')
          }
        }
      } else {
        if (core.level!.progress < levels[core.level!.levelId].target) {
          chipDef.initAction(core, chip)
        } else {
          core.mutateWs(({ world }) => {
            world.marks[karol.y][karol.x] = true
          })
          addMessage(core, 'Fertig!')
        }
      }
    }
  }
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
    addMessage(core, 'Dieses Feld kann nicht verändert werden.')
    return false
  }

  if (blocks[pos.y][pos.x]) {
    core.mutateWs(({ world }) => {
      world.blocks[pos.y][pos.x] = false
    })
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

export function initWorld(core: Core) {
  core.ws.world.chips.forEach((chip) => {
    chips[chip.tag].initAction(core, chip)
  })

  core.mutateWs((state) => {
    if (state.type == 'level') {
      state.worldInit = true
      state.worldCheckpoint = state.world
    }
  })
}

export function resetWorld(core: Core) {
  core.mutateWs((state) => {
    if (state.type == 'level' && state.worldCheckpoint) {
      state.world = state.worldCheckpoint
      state.progress = 0
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
  return core.ws.world.chips.some((chip) =>
    chips[chip.tag].isReadOnly(core, chip, x, y)
  )
}
