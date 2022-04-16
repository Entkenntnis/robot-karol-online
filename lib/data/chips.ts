import { addMessage } from '../commands/messages'
import { initWorld } from '../commands/world'
import { Core } from '../state/core'
import { Chip, ChipInWorld } from '../state/types'
import { levels } from './levels'

export const chips: { [key: string]: Chip } = {
  inverter: {
    tag: 'inverter',
    checkAction: (core: Core, chip: ChipInWorld) => {
      const world = core.ws.world
      const { karol } = world
      if (
        karol.x == chip.x + 2 &&
        karol.y == chip.y &&
        world.marks[karol.y][karol.x]
      ) {
        const input = world.bricks[chip.y + 1][chip.x]
        const output = world.bricks[chip.y + 1][chip.x + 4]
        if ((input == 1 && output == 0) || (input == 0 && output == 1)) {
          core.mutateWs((state) => {
            if (state.type == 'level') {
              state.progress++
            }
          })
          const val = Math.random() < 0.5
          core.mutateWs(({ world }) => {
            world.bricks[chip.y + 1][chip.x] = val ? 1 : 0
          })
          addMessage(core, 'Inverter: Korrekte Belegung! Neue Eingabe gesetzt.')
        } else if (
          core.ws.type == 'level' &&
          core.ws.progress < levels[core.ws.levelId].target
        ) {
          addMessage(
            core,
            'Inverter: Falsche Belegung! Fortschritt zurückgesetzt.'
          )
          core.mutateWs((state) => {
            if (state.type == 'level') {
              state.progress = 0
            }
          })
          core.mutateWs(({ world }) => {
            world.marks[karol.y][karol.x] = false
          })
        }
      }
    },
    initAction: (core: Core, ciw: ChipInWorld) => {
      const val = Math.random() < 0.5 ? 1 : 0
      core.mutateWs(({ world }) => {
        world.bricks[ciw.y + 1][ciw.x] = val
      })
    },
    isReadOnly: (core: Core, chip: ChipInWorld, x: number, y: number) => {
      if (x == chip.x && y == chip.y + 1) {
        return true
      }
      return false
    },
    image: '/chips/inverter.png',
    imageXOffset: -47,
    imageYOffset: -2,
  },
}
