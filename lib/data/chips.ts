import { addMessage } from '../commands/messages'
import { createSparkle } from '../commands/sparkle'
import { Core } from '../state/core'
import { Chip, ChipInWorld } from '../state/types'
import { levels } from './levels'

export const chips: { [key: string]: Chip } = {
  inverter: {
    tag: 'inverter',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
      const input = world.bricks[chip.y + 1][chip.x]
      const output = world.bricks[chip.y + 1][chip.x + 4]
      return (input == 1 && output == 0) || (input == 0 && output == 1)
    },
    initAction: (core: Core, chip: ChipInWorld) => {
      const val = Math.random() < 0.5 ? 1 : 0
      core.mutateWs(({ world }) => {
        world.bricks[chip.y + 1][chip.x] = val
        world.bricks[chip.y + 1][chip.x + 4] = 0
        world.blocks[chip.y + 1][chip.x + 4] = false
        world.marks[chip.y + 1][chip.x + 4] = false
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      if (x == 0 && y == 0) return true
      if (x == chip.x && y == chip.y + 1) {
        return true
      }
      if (
        core.ws.type == 'level' &&
        core.ws.progress >= levels[core.ws.levelId].target &&
        x == chip.x + 4 &&
        y == chip.y + 1
      ) {
        return true
      }
      return false
    },
    image: '/chips/inverter.png',
    imageXOffset: -47,
    imageYOffset: -2,
    checkpointX: 2,
    checkpointY: 0,
    sparkleX: 260,
    sparkleY: 80,
  },
  start: {
    tag: 'start',
    checkAction: (core: Core, chip: ChipInWorld) => {
      return false
      /*const world = core.ws.world
      const { karol } = world
      if (karol.x == chip.x + 1 && karol.y == chip.y) {
        if (world.marks[karol.y][karol.x]) {
          const output = world.bricks[chip.y + 1][chip.x + 3]
          if (output == 1) {
            core.mutateLevel((state) => {
              state.progress++
            })
            createSparkle(core, 250, 80, 'happy')
            addMessage(core, 'Lösche die Marke, um weiter zu machen.')

            if (core.level!.progress >= levels[core.level!.levelId].target) {
              core.mutateWs(({ world }) => {
                world.bricks[chip.y + 1][chip.x + 3] = 0
                world.blocks[chip.y + 1][chip.x + 3] = true
                world.marks[chip.y + 1][chip.x + 3] = false
              })
            }
          } else {
            if (core.level!.progress < levels[core.level!.levelId].target) {
              addMessage(core, 'Falsche Belegung! Fortschritt zurückgesetzt.')
              core.mutateLevel((state) => {
                state.progress = 0
              })
              core.mutateWs(({ world }) => {
                world.marks[karol.y][karol.x] = false
              })
              createSparkle(core, 250, 80, 'fail')
            }
          }
        } else {
          if (core.level!.progress < levels[core.level!.levelId].target) {
            chips['start'].initAction(core, chip)
          }
        }
      }*/
    },
    initAction: (core: Core, chip: ChipInWorld) => {},
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      return false
    },
    image: '/chips/start.png',
    imageXOffset: -43,
    imageYOffset: -1,
    checkpointX: 2,
    checkpointY: 0,
    sparkleX: 250,
    sparkleY: 80,
  },
  copy: {
    tag: 'copy',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
      const input1 = world.bricks[chip.y + 2][chip.x]
      const output1 = world.bricks[chip.y + 2][chip.x + 4]
      const input2 = world.bricks[chip.y + 4][chip.x]
      const output2 = world.bricks[chip.y + 4][chip.x + 4]
      return input1 == output1 && input2 == output2
    },
    initAction: (core: Core, chip: ChipInWorld) => {
      const yOffset = Math.random() < 0.5 ? 2 : 4
      core.mutateWs(({ world }) => {
        // reset
        world.bricks[chip.y + 2][chip.x + 4] = 0
        world.blocks[chip.y + 2][chip.x + 4] = false
        world.marks[chip.y + 2][chip.x + 4] = false
        world.bricks[chip.y + 4][chip.x + 4] = 0
        world.blocks[chip.y + 4][chip.x + 4] = false
        world.marks[chip.y + 4][chip.x + 4] = false
        world.bricks[chip.y + 2][chip.x] = 0
        world.blocks[chip.y + 2][chip.x] = false
        world.marks[chip.y + 2][chip.x] = false
        world.bricks[chip.y + 4][chip.x] = 0
        world.blocks[chip.y + 4][chip.x] = false
        world.marks[chip.y + 4][chip.x] = false

        world.bricks[chip.y + yOffset][chip.x] = 1
        world.blocks[chip.y + yOffset][chip.x] = false
        world.marks[chip.y + yOffset][chip.x] = false
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      if (x == 0 && y == 0) return true // orientation mark
      if (
        (x == chip.x && y == chip.y + 2) ||
        (x == chip.x && y == chip.y + 4)
      ) {
        return true
      }
      if (
        core.ws.type == 'level' &&
        core.ws.progress >= levels[core.ws.levelId].target &&
        ((x == chip.x + 4 && y == chip.y + 2) ||
          (x == chip.x + 4 && y == chip.y + 4))
      ) {
        return true
      }
      return false
    },
    image: '/chips/copy.png',
    imageXOffset: -88,
    imageYOffset: -3,
    checkpointX: 2,
    checkpointY: 0,
    sparkleX: 320,
    sparkleY: 80,
  },
  treppe: {
    tag: 'treppe',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
      const brick1 = world.bricks[chip.y][chip.x + 5]
      const brick2 = world.bricks[chip.y][chip.x + 4]
      const brick3 = world.bricks[chip.y][chip.x + 3]
      const brick4 = world.bricks[chip.y][chip.x + 2]
      const brick5 = world.bricks[chip.y][chip.x + 1]
      const mark3 = world.marks[chip.y + 1][chip.x + 3]
      const mark4 = world.marks[chip.y + 1][chip.x + 2]
      const mark5 = world.marks[chip.y + 1][chip.x + 1]

      const startCorrect = brick1 == 1 && brick2 == 2 && brick3 == 3
      const case3 = mark3 && brick4 == 0 && brick5 == 0
      const case4 = mark4 && brick4 == 4 && brick5 == 0
      const case5 = mark5 && brick4 == 4 && brick5 == 5

      return startCorrect && (case3 || case4 || case5)
    },
    initAction: (core: Core, chip: ChipInWorld) => {
      const offsetX = Math.floor(Math.random() * 3)
      core.mutateWs(({ world }) => {
        for (let x = chip.x + 1; x <= chip.x + 5; x++) {
          world.bricks[chip.y][x] = 0
          world.blocks[chip.y][x] = false
          world.marks[chip.y][x] = false
        }

        for (let x = chip.x + 1; x <= chip.x + 5; x++) {
          world.bricks[chip.y + 1][x] = 0
          world.blocks[chip.y + 1][x] = false
          world.marks[chip.y + 1][x] = false
        }

        world.marks[chip.y + 1][chip.x + 1 + offsetX] = true
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      if (y == chip.y + 1 && x > chip.x && x <= chip.x + 3) {
        const diff = x - chip.x // 1, 2 or 3
        if (diff == 1) return true
        if (diff == 2) {
          if (core.ws.world.marks[y][chip.x + 1]) {
            return false
          } else {
            return true
          }
        }
        if (diff == 3) {
          if (
            core.ws.world.marks[y][chip.x + 1] ||
            core.ws.world.marks[y][chip.x + 2]
          ) {
            return false
          } else {
            return true
          }
        }
      }
      if (
        core.ws.type == 'level' &&
        core.ws.progress >= levels[core.ws.levelId].target &&
        y == chip.y &&
        x > chip.x &&
        x <= chip.x + 5
      ) {
        return true
      }
      return false
    },
    image: '/chips/treppe.png',
    imageXOffset: -44,
    imageYOffset: -3,
    checkpointX: 7,
    checkpointY: 1,
    sparkleX: 320,
    sparkleY: 80,
  },
  aufraumer: {
    tag: 'aufraumer',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
      return [1, 2, 3, 4, 5].every(
        (offsetX) =>
          world.marks[chip.y][chip.x + offsetX] == false &&
          world.blocks[chip.y][chip.x + offsetX] == false &&
          world.bricks[chip.y][chip.x + offsetX] == 0
      )
    },
    initAction: (core: Core, chip: ChipInWorld) => {
      core.mutateWs(({ world }) => {
        for (let x = chip.x + 1; x <= chip.x + 5; x++) {
          world.blocks[chip.y][x] = false

          world.bricks[chip.y][x] =
            Math.random() < 0.4 ? 0 : Math.floor(Math.random() * 4) + 1
          world.marks[chip.y][x] = Math.random() < 0.5
        }
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      if (
        core.ws.type == 'level' &&
        core.ws.progress >= levels[core.ws.levelId].target &&
        y == chip.y &&
        x > chip.x &&
        x <= chip.x + 5
      ) {
        return true
      }
      return false
    },
    image: '/chips/aufraumer.png',
    imageXOffset: -44,
    imageYOffset: -3,
    checkpointX: 7,
    checkpointY: 1,
    sparkleX: 320,
    sparkleY: 80,
  },
  stapler: {
    tag: 'stapler',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
      return (
        world.bricks[chip.y + 1][chip.x + 0] == 0 &&
        world.bricks[chip.y + 1][chip.x + 1] == 0 &&
        world.bricks[chip.y + 1][chip.x + 2] == 0 &&
        world.bricks[chip.y + 1][chip.x + 6] == chip.chipState
      )
    },
    initAction: (core: Core, chip: ChipInWorld) => {
      const sum = Math.floor(Math.random() * 7 + 4)
      const t1 = Math.floor(Math.random() * 4)
      const rem = sum - t1
      const t2 = Math.floor(Math.random() * rem)

      core.mutateWs(({ world }) => {
        ;[0, 1, 2, 6].forEach((offsetX) => {
          world.blocks[chip.y + 1][chip.x + offsetX] = false
          world.marks[chip.y + 1][chip.x + offsetX] = false
          world.bricks[chip.y + 1][chip.x + offsetX] = 0
        })
        world.bricks[chip.y + 1][chip.x] = t1
        world.bricks[chip.y + 1][chip.x + 1] = t2
        world.bricks[chip.y + 1][chip.x + 2] = sum - t1 - t2
        world.chips[0].chipState = sum
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      if (
        core.ws.type == 'level' &&
        core.ws.progress >= levels[core.ws.levelId].target &&
        y == chip.y + 1 &&
        (x == chip.x || x == chip.x + 1 || x == chip.x + 2 || x == chip.x + 6)
      ) {
        return true
      }
      return false
    },
    image: '/chips/stapler.png',
    imageXOffset: -44,
    imageYOffset: -3,
    checkpointX: 4,
    checkpointY: 0,
    sparkleX: 320,
    sparkleY: 80,
  },
  kopierer: {
    tag: 'kopierer',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
      return [1, 2, 3, 4].every((offsetY) => {
        return (
          world.blocks[chip.y + offsetY][chip.x] == false &&
          world.blocks[chip.y + offsetY][chip.x + 4] == false &&
          world.marks[chip.y + offsetY][chip.x] ==
            world.marks[chip.y + offsetY][chip.x + 4] &&
          world.bricks[chip.y + offsetY][chip.x] ==
            world.bricks[chip.y + offsetY][chip.x + 4]
        )
      })
    },
    initAction: (core: Core, chip: ChipInWorld) => {
      core.mutateWs(({ world }) => {
        ;[1, 2, 3, 4].forEach((offsetY) => {
          world.blocks[chip.y + offsetY][chip.x] = false
          world.marks[chip.y + offsetY][chip.x] = Math.random() < 0.5
          world.bricks[chip.y + offsetY][chip.x] = Math.random() < 0.5 ? 0 : 1

          world.blocks[chip.y + offsetY][chip.x + 4] = false
          world.marks[chip.y + offsetY][chip.x + 4] = false
          world.bricks[chip.y + offsetY][chip.x + 4] = 0
        })
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      if (x == chip.x && y > chip.y && y <= chip.y + 4) return true
      if (
        core.ws.type == 'level' &&
        core.ws.progress >= levels[core.ws.levelId].target &&
        x == chip.x + 4 &&
        y > chip.y &&
        y <= chip.y + 4
      ) {
        return true
      }
      return false
    },
    image: '/chips/kopierer.png',
    imageXOffset: -89,
    imageYOffset: -2,
    checkpointX: 2,
    checkpointY: 0,
    sparkleX: 290,
    sparkleY: 80,
  },
}
