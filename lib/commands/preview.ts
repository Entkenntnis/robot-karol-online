// this will be a huge (ugly) file, but hey, let's try this

import { Core } from '../state/core'
import { Op, World } from '../state/types'
import { move, turnLeft, turnRight } from './world'

export function execPreview(core: Core) {
  const bytecode = core.ws.vm.bytecode
  if (!bytecode) return
  if (!core.ws.ui.showPreview) return
  const world = JSON.parse(JSON.stringify(core.ws.world)) as World
  const track: { x: number; y: number }[] = [
    { x: world.karol.x, y: world.karol.y },
  ]
  let pc = 0
  const callstack: number[] = []
  const frames: { [index: number]: number }[] = []
  while (pc < bytecode.length) {
    const instr = bytecode[pc]
    switch (instr.type) {
      case 'action':
        pc++
        switch (instr.command) {
          case 'left':
            world.karol.dir = turnLeft(world.karol.dir)
            continue
          case 'right':
            world.karol.dir = turnRight(world.karol.dir)
            continue
          case 'forward':
            const target = move(
              world.karol.x,
              world.karol.y,
              world.karol.dir,
              world
            )
            if (!target) continue

            const currentBrickCount = world.bricks[world.karol.y][world.karol.x]
            const targetBrickCount = world.bricks[target.y][target.x]

            if (Math.abs(currentBrickCount - targetBrickCount) > 1) continue

            world.karol.x = target.x
            world.karol.y = target.y
            track.push(target)
            continue
        }
      default:
        console.log('not implemented', instr)
        pc++
    }
  }

  core.mutateWs(({ ui }) => {
    ui.preview.track = track
    ui.preview.karol = world.karol
  })
}
