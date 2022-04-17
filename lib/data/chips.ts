import { addMessage } from '../commands/messages'
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
            core.mutateWs((state) => {
              if (state.type == 'level') {
                state.progress++
              }
            })
            /*addMessage(
              core,
              'Lösche die Marke, um eine neue Belegung zu erhalten.'
            )*/
            ;(async () => {
              for (let i = 0; i < 20; i++) {
                console.log('update', i)
                core.mutateWs((state) => {
                  if (state.type == 'level') {
                    state.sparkle = {
                      type: 'happy',
                      posX: 260,
                      posY: 80 - i * 4,
                    }
                  }
                })
                await sleep(20)
              }
              await sleep(500)
              core.mutateWs((state) => {
                if (state.type == 'level') {
                  state.sparkle = undefined
                }
              })
            })()
          } else {
            if (
              core.ws.type == 'level' &&
              core.ws.progress < levels[core.ws.levelId].target
            ) {
              addMessage(core, 'Falsche Belegung! Fortschritt zurückgesetzt.')
              core.mutateWs((state) => {
                if (state.type == 'level') {
                  state.progress = 0
                }
              })
              core.mutateWs(({ world }) => {
                world.marks[karol.y][karol.x] = false
              })
              ;(async () => {
                for (let i = 0; i < 20; i++) {
                  console.log('update', i)
                  core.mutateWs((state) => {
                    if (state.type == 'level') {
                      state.sparkle = {
                        type: 'fail',
                        posX: 260,
                        posY: 80 - i * 4,
                      }
                    }
                  })
                  await sleep(20)
                }
                await sleep(500)
                core.mutateWs((state) => {
                  if (state.type == 'level') {
                    state.sparkle = undefined
                  }
                })
              })()
            }
          }
        } else {
          if (
            core.ws.type == 'level' &&
            core.ws.progress < levels[core.ws.levelId].target
          ) {
            chips['inverter'].initAction(core, chip)
          } else {
            core.mutateWs(({ world }) => {
              world.bricks[chip.y + 1][chip.x] = 0
              world.blocks[chip.y + 1][chip.x] = true
              world.marks[chip.y + 1][chip.x] = false
              world.bricks[chip.y + 1][chip.x + 4] = 0
              world.blocks[chip.y + 1][chip.x + 4] = true
              world.marks[chip.y + 1][chip.x + 4] = false
            })
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
}

function sleep(t: number) {
  return new Promise((res) => setTimeout(res, t))
}
