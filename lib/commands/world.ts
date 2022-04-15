import { Core } from '../state/core'
import { createWorld } from '../state/create'
import { Heading, World } from '../state/types'
import { addMessage } from './messages'

export function forward(core: Core, opts?: { reverse: boolean }) {
  const { world } = core.ws
  const { karol, bricks } = world
  const dir = opts?.reverse ? reverse(karol.dir) : karol.dir
  const target = move(karol.x, karol.y, dir, world)
  if (target) {
    const currentBrickCount = bricks[karol.y][karol.x]
    const targetBrickCount = bricks[target.y][target.x]

    if (Math.abs(currentBrickCount - targetBrickCount) > 1) {
      addMessage(core, 'Karol kann diese Höhe nicht überwinden.')
    } else {
      core.mutateWs(({ world }) => {
        world.karol.x = target.x
        world.karol.y = target.y
      })
      return true
    }
  } else {
    addMessage(core, 'Karol kann sich nicht in diese Richtung bewegen.')
  }
  return false
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

  if (pos) {
    if (bricks[pos.y][pos.x] >= height) {
      addMessage(core, 'Maximale Stapelhöhe erreicht.')
      return false
    } else {
      core.mutateWs((state) => {
        state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] + 1
      })
      return true
    }
  } else {
    addMessage(core, 'Karol kann hier keinen Ziegel aufstellen.')
    return false
  }
}

export function unbrick(core: Core) {
  const { world } = core.ws
  const { karol, bricks } = world
  const pos = move(karol.x, karol.y, karol.dir, world)

  if (pos) {
    if (bricks[pos.y][pos.x] <= 0) {
      addMessage(core, 'Keine Ziegel zum Aufheben')
      return false
    } else {
      core.mutateWs((state) => {
        state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] - 1
      })
      return true
    }
  } else {
    addMessage(core, 'Karol kann hier keine Ziegel aufheben.')
    return false
  }
}

export function toggleMark(core: Core) {
  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] =
      !world.marks[world.karol.y][world.karol.x]
  })
  checkChipActive(core)
}

export function setMark(core: Core) {
  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] = true
  })
  checkChipActive(core)
}

export function resetMark(core: Core) {
  core.mutateWs(({ world }) => {
    world.marks[world.karol.y][world.karol.x] = false
  })
}

function checkChipActive(core: Core) {
  const { world } = core.ws
  const { karol, chips } = world
  for (const chip of chips) {
    if (chip.type == 'inverter') {
      if (
        karol.x == chip.x + 2 &&
        karol.y == chip.y + 2 &&
        world.marks[karol.y][karol.x]
      ) {
        const input = world.bricks[chip.y + 1][chip.x]
        const output = world.bricks[chip.y + 1][chip.x + 4]
        if ((input == 1 && output == 0) || (input == 0 && output == 1)) {
          core.mutateWs(({ ui }) => {
            ui.progress++
          })
          const val = Math.random() < 0.5
          core.mutateWs(({ world }) => {
            world.bricks[chip.y + 1][chip.x] = val ? 1 : 0
          })
          addMessage(core, 'Inverter: Korrekte Belegung! Neue Eingabe gesetzt.')
        } else {
          addMessage(
            core,
            'Inverter: Falsche Belegung! Fortschritt zurückgesetzt.'
          )
          core.mutateWs(({ ui }) => {
            ui.progress = 0
          })
          core.mutateWs(({ world }) => {
            world.marks[karol.y][karol.x] = false
          })
        }
      }
    }
  }
}

export function toggleBlock(core: Core) {
  const { world } = core.ws
  const { karol, blocks, bricks, marks } = world
  const pos = moveRaw(karol.x, karol.y, karol.dir, world)
  if (pos) {
    if (blocks[pos.y][pos.x]) {
      core.mutateWs(({ world }) => {
        world.blocks[pos.y][pos.x] = false
      })
      return true
    } else if (!marks[pos.y][pos.x] && bricks[pos.y][pos.x] == 0) {
      core.mutateWs(({ world }) => {
        world.blocks[pos.y][pos.x] = true
      })
      return true
    } else {
      if (marks[pos.y][pos.x]) {
        addMessage(core, 'Karol kann keinen Quader auf eine Marke stellen.')
      } else {
        addMessage(core, 'Karol kann keinen Quader auf Ziegel stellen.')
      }
    }
  } else {
    addMessage(core, 'Karol kann hier keinen Quader aufstellen.')
  }
  return false
}

export function createWorldCmd(core: Core, x: number, y: number, z: number) {
  core.mutateWs((state) => {
    state.world = createWorld(x, y, z)
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

function reverse(h: Heading) {
  return { north: 'south', south: 'north', east: 'west', west: 'east' }[
    h
  ] as Heading
}

function turnLeft(h: Heading) {
  return {
    north: 'west',
    west: 'south',
    south: 'east',
    east: 'north',
  }[h] as Heading
}

function turnRight(h: Heading) {
  return {
    north: 'east',
    east: 'south',
    south: 'west',
    west: 'north',
  }[h] as Heading
}
