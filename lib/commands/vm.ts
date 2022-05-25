import { Core } from '../state/core'
import { Condition, Op, Speed } from '../state/types'
import { execPreview } from './preview'
import {
  forward,
  left,
  right,
  brick,
  unbrick,
  setMark,
  resetMark,
  move,
  moveRaw,
} from './world'

export function patch(core: Core, bytecode: Op[]) {
  core.mutateWs(({ vm, ui }) => {
    vm.bytecode = bytecode
    ui.state = 'ready'
  })
}

export function run(core: Core) {
  core.mutateWs(({ ui, vm }) => {
    ui.state = 'running'
    vm.pc = 0
    vm.frames = [{}]
    ui.gutterReturns = []
    vm.callstack = []
    vm.needsConfirmation = false
    vm.confirmation = false
    ui.preview = undefined
  })
  internal_step(core)
}

function internal_step(core: Core) {
  const pc = core.ws.vm.pc
  const byteCode = core.ws.vm.bytecode
  const state = core.ws.ui.state

  if (state != 'running') {
    throw new Error('internal step assumes running state')
  }

  if (!byteCode)
    throw new Error("Invalid bytecode, shouldn't be in running state")

  if (pc >= byteCode.length) {
    // end reached
    callWithDelay(core, () => abort(core), byteCode.length == 0 ? 400 : 0)
    return
  }

  const op = byteCode[pc]

  /*console.log(
    'step',
    pc,
    op,
    this.current.vm.counter,
    this.current.vm.callstack
  )*/

  const delay =
    core.ws.settings.speed == 'slow'
      ? 300
      : core.ws.settings.speed == 'fast'
      ? 40
      : 0

  //console.log(this.state.ui.gutterReturns)

  if (op.line) {
    const line = op.line
    core.mutateWs(({ ui }) => {
      ui.gutter = line
    })

    if (core.ws.settings.speed == 'step') {
      if (core.ws.vm.needsConfirmation && core.ws.vm.confirmation) {
        // ok, confirmation is given
        core.mutateWs(({ vm }) => {
          vm.needsConfirmation = false
          vm.confirmation = false
        })
      } else if (core.ws.vm.needsConfirmation && !core.ws.vm.confirmation) {
        // no confirmation given yet
        return
      } else {
        core.mutateWs(({ vm }) => {
          vm.needsConfirmation = true
          vm.confirmation = false
        })
        return
      }
    }
  }

  if (op.type == 'action') {
    callWithDelay(
      core,
      () => {
        if (op.type == 'action') {
          if (op.command == 'forward') {
            forward(core)
          }
          if (op.command == 'left') {
            left(core)
          }
          if (op.command == 'right') {
            right(core)
          }
          if (op.command == 'brick') {
            brick(core)
          }
          if (op.command == 'unbrick') {
            unbrick(core)
          }
          if (op.command == 'setMark') {
            setMark(core)
          }
          if (op.command == 'resetMark') {
            resetMark(core)
          }
          core.mutateWs((state) => {
            state.vm.pc++
          })
          callWithDelay(core, () => internal_step(core))
        }
      },
      delay
    )
    return
  } else {
    if (op.type == 'jumpn') {
      core.mutateWs(({ vm }) => {
        const frame = vm.frames[vm.frames.length - 1]
        if (frame[pc] === undefined) {
          frame[pc] = op.count
        }
      })
      const frame = core.ws.vm.frames[core.ws.vm.frames.length - 1]
      if (frame[pc] == 0) {
        core.mutateWs((state) => {
          const frame = state.vm.frames[state.vm.frames.length - 1]
          state.vm.pc++
          delete frame[pc]
        })
        callWithDelay(core, () => internal_step(core))
        return
      } else {
        core.mutateWs((state) => {
          const frame = state.vm.frames[state.vm.frames.length - 1]
          state.vm.pc = op.target
          frame[pc]--
        })
        callWithDelay(core, () => internal_step(core))
        return
      }
    }
    if (op.type == 'jumpcond') {
      const flag = testCondition(core, op.condition)
      core.mutateWs((state) => {
        state.vm.pc = flag ? op.targetT : op.targetF
      })
      callWithDelay(core, () => internal_step(core))
      return
    }
    if (op.type == 'call') {
      core.mutateWs((state) => {
        const { vm, ui } = state
        vm.callstack.push(vm.pc + 1)
        vm.frames.push({})
        vm.pc = op.target
        ui.gutterReturns.push(op.line)
      })
      callWithDelay(core, () => internal_step(core))
      return
    }
    if (op.type == 'return') {
      core.mutateWs(({ vm, ui }) => {
        ui.gutterReturns.pop()
        const target = vm.callstack.pop()
        vm.frames.pop()
        vm.pc = target ?? Infinity
      })
      callWithDelay(core, () => internal_step(core))
      return
    }
  }
}

export function testCondition(core: Core, cond: Condition) {
  const { x, y, dir } = core.ws.world.karol
  if (cond.type == 'mark') {
    const val = core.ws.world.marks[y][x]
    if (cond.negated) {
      return !val
    }
    return val
  } else if (cond.type == 'wall') {
    const newpos = move(x, y, dir, core.ws.world)
    if (cond.negated) {
      return !!newpos
    }
    return !newpos
  } else {
    const newpos = moveRaw(x, y, dir, core.ws.world)
    if (!newpos) {
      return cond.negated ? true : false
    } else {
      const count = core.ws.world.bricks[newpos.y][newpos.x]
      return cond.negated ? count == 0 : count > 0
    }
  }
}

export function setSpeed(core: Core, val: string) {
  const speed = val as Speed
  clearTimeout(core.ws.vm.handler!)
  core.mutateWs((state) => {
    state.settings.speed = speed
  })
  if (core.ws.ui.state == 'running') {
    internal_step(core)
  }
}

export function abort(core: Core) {
  clearTimeout(core.ws.vm.handler!)
  core.mutateWs((state) => {
    state.ui.gutter = 0
    state.ui.state = 'ready'
    state.vm.pc = 0
    state.vm.handler = undefined
    state.ui.gutterReturns = []
    if (state.type == 'free' || state.type == 'puzzle') {
      state.ui.shouldFocusWrapper = true
    }
  })

  setTimeout(() => {
    execPreview(core)
  }, 10)
}

export function confirmStep(core: Core) {
  if (core.ws.vm.needsConfirmation) {
    core.mutateWs(({ vm }) => {
      vm.confirmation = true
    })
    internal_step(core)
  }
}

function callWithDelay(core: Core, f: () => void, delay: number = 0) {
  const h = setTimeout(f, delay)
  core.mutateWs(({ vm }) => {
    vm.handler = h
  })
}
