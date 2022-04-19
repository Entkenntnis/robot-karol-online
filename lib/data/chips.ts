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
      const { karol } = world
      if (karol.x == chip.x + 2 && karol.y == chip.y) {
        if (world.marks[karol.y][karol.x]) {
          const input = world.bricks[chip.y + 1][chip.x]
          const output = world.bricks[chip.y + 1][chip.x + 4]
          if ((input == 1 && output == 0) || (input == 0 && output == 1)) {
            const isGlitch = Math.random() < 0.1 // 10 % chance of not progressing
            if (isGlitch) {
              addMessage(core, 'Sorry, manchmal passieren Glitches.')
              return
            }
            core.mutateLevel((state) => {
              state.progress++
            })
            createSparkle(core, 260, 80, 'happy')
          } else {
            if (core.level!.progress < levels[core.level!.levelId].target) {
              addMessage(core, 'Falsche Belegung! Fortschritt zurückgesetzt.')
              core.mutateLevel((state) => {
                state.progress = 0
              })
              core.mutateWs(({ world }) => {
                world.marks[karol.y][karol.x] = false
              })
              createSparkle(core, 260, 80, 'fail')
            }
          }
        } else {
          if (core.level!.progress < levels[core.level!.levelId].target) {
            chips['inverter'].initAction(core, chip)
          } else {
            core.mutateWs(({ world }) => {
              world.marks[karol.y][karol.x] = true
            })
            addMessage(core, 'Fertig!')
          }
        }
      }
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
  },
  start: {
    tag: 'start',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
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
      }
    },
    initAction: (core: Core, chip: ChipInWorld) => {
      core.mutateWs(({ world }) => {
        world.bricks[chip.y + 1][chip.x + 3] = 0
        world.blocks[chip.y + 1][chip.x + 3] = false
        world.marks[chip.y + 1][chip.x + 3] = false
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      return false
    },
    image: '/chips/start.png',
    imageXOffset: -43,
    imageYOffset: -1,
  },
}
