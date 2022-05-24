// this will be a huge (ugly) file, but hey, let's try this

import { Core } from '../state/core'
import { World } from '../state/types'
import { testCondition } from './vm'
import { move, turnLeft, turnRight } from './world'

export function showPreview(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showPreview = true
  })
}

export function hidePreview(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.showPreview = false
  })
}

export function execPreview(core: Core) {
  const bytecode = core.ws.vm.bytecode
  if (!bytecode) return
  if (!core.ws.ui.showPreview) return
  const world = JSON.parse(JSON.stringify(core.ws.world)) as World
  const track: { x: number; y: number }[] = [
    { x: world.karol.x, y: world.karol.y },
  ]
  let pc = 0
  let counter = 0
  const callstack: number[] = []
  const frames: { [index: number]: number }[] = [{}]
  while (pc < bytecode.length) {
    counter++
    if (counter > 4000) {
      // limit run time
      pc = -1
      break
    }
    const instr = bytecode[pc]
    switch (instr.type) {
      case 'action':
        pc++
        const target = move(
          world.karol.x,
          world.karol.y,
          world.karol.dir,
          world
        )
        switch (instr.command) {
          case 'left':
            world.karol.dir = turnLeft(world.karol.dir)
            continue
          case 'right':
            world.karol.dir = turnRight(world.karol.dir)
            continue
          case 'forward':
            if (!target) continue

            const currentBrickCount = world.bricks[world.karol.y][world.karol.x]
            const targetBrickCount = world.bricks[target.y][target.x]

            if (Math.abs(currentBrickCount - targetBrickCount) > 1) continue

            world.karol.x = target.x
            world.karol.y = target.y
            track.push(target)
            continue
          case 'brick':
            if (!target) continue
            if (world.bricks[target.y][target.x] >= world.height) continue
            world.bricks[target.y][target.x]++
            continue
          case 'unbrick':
            if (!target) continue
            if (world.bricks[target.y][target.x] <= 0) continue
            world.bricks[target.y][target.x]--
            continue
          case 'setMark':
            world.marks[world.karol.y][world.karol.x] = true
            continue
          case 'resetMark':
            world.marks[world.karol.y][world.karol.x] = false
            continue
        }
      case 'jumpn':
        const frame = frames[frames.length - 1]
        if (frame[pc] === undefined) {
          frame[pc] = instr.count
        }
        if (frame[pc] == 0) {
          delete frame[pc]
          pc++
          continue
        } else {
          frame[pc]--
          pc = instr.target
          continue
        }
      case 'jumpcond':
        const flag = testCondition({ ws: { world } } as Core, instr.condition)
        pc = flag ? instr.targetT : instr.targetF
        continue
      case 'call':
        callstack.push(pc + 1)
        frames.push({})
        pc = instr.target
        continue
      case 'return':
        const jump_target = callstack.pop() ?? Infinity
        frames.pop()
        pc = jump_target
        continue
      default:
        throw new Error('this is not implemented')
    }
  }

  core.mutateWs(({ ui }) => {
    ui.preview = { track, karol: pc >= 0 ? world.karol : undefined, world }
  })
}
