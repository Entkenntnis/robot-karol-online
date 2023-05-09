import { sliderToDelay } from '../helper/speedSlider'
import { submitSolution } from '../helper/submitSolution'
import { Core } from '../state/core'
import { Condition, Op } from '../state/types'
import { editCodeAndResetProgress } from './mode'
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
    ui.isManualAbort = false
    ui.isTestingAborted = false
    ui.isEndOfRun = false
    ui.karolCrashMessage = undefined
    vm.pc = 0
    vm.frames = [{}]
    ui.gutterReturns = []
    vm.callstack = []
    vm.needsConfirmation = false
    vm.confirmation = false
    vm.startTime = Date.now()
    vm.steps = 1
  })

  markCurrentPC(core)
  pulse(core)
}

function pulse(core: Core) {
  if (core.ws.ui.state !== 'running' || !core.ws.vm.startTime) {
    return // program has been terminated or aborted
  }

  // trying to call
  const delay = sliderToDelay(core.ws.ui.speedSliderValue)
  //console.log(delay)

  const elapsedTime = Date.now() - core.ws.vm.startTime

  const targetStep = Math.floor(elapsedTime / delay)

  let stepsInThisLoop = 0

  while (core.ws.vm.steps < targetStep && core.ws.ui.state == 'running') {
    internal_step(core)
    // console.log('step nr. ' + core.ws.vm.steps)

    stepsInThisLoop++

    if (stepsInThisLoop > 25) {
      core.mutateWs(({ vm }) => {
        vm.startTime = Date.now() - vm.steps * delay // maximal skipping reached
      })
      console.log('maximum skipping')
      break
    }
  }
  requestAnimationFrame(() => {
    pulse(core)
  })
}

function markCurrentPC(core: Core) {
  if (core.ws.vm.bytecode) {
    const op = core.ws.vm.bytecode[core.ws.vm.pc]
    if (op?.line) {
      const line = op.line
      core.mutateWs(({ ui }) => {
        ui.gutter = line
      })
    }
  }
}

// old
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
    // regression: minimal run time for empty program

    endExecution(core)

    // end reached
    /*callWithDelay_DEPRECATED(
      core,
      () => endExecution(core),
      byteCode.length == 0 ? 400 : 0
    )*/
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

  // console.log(delay)

  //console.log(this.state.ui.gutterReturns)

  if (op.type == 'action') {
    if (op.type == 'action') {
      let result = undefined
      if (op.command == 'forward') {
        result = forward(core)
      }
      if (op.command == 'left') {
        left(core)
      }
      if (op.command == 'right') {
        right(core)
      }
      if (op.command == 'brick') {
        result = brick(core)
      }
      if (op.command == 'unbrick') {
        result = unbrick(core)
      }
      if (op.command == 'setMark') {
        result = setMark(core)
      }
      if (op.command == 'resetMark') {
        result = resetMark(core)
      }
      if (result === false) {
        return
      }
      core.mutateWs((state) => {
        state.vm.pc++
      })
    }
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
      } else {
        core.mutateWs((state) => {
          const frame = state.vm.frames[state.vm.frames.length - 1]
          state.vm.pc = op.target
          frame[pc]--
        })
      }
    }
    if (op.type == 'jumpcond') {
      const flag = testCondition(core, op.condition)
      core.mutateWs((state) => {
        state.vm.pc = flag ? op.targetT : op.targetF
      })
    }
    if (op.type == 'call') {
      core.mutateWs((state) => {
        const { vm, ui } = state
        vm.callstack.push(vm.pc + 1)
        vm.frames.push({})
        vm.pc = op.target
        ui.gutterReturns.push(op.line)
      })
    }
    if (op.type == 'return') {
      core.mutateWs(({ vm, ui }) => {
        ui.gutterReturns.pop()
        const target = vm.callstack.pop()
        vm.frames.pop()
        vm.pc = target ?? Infinity
      })
    }
  }

  markCurrentPC(core)

  core.mutateWs(({ vm }) => {
    vm.steps++
  })
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
  } else if (cond.type == 'north') {
    if (cond.negated) {
      return dir !== 'north'
    } else {
      return dir == 'north'
    }
  } else if (cond.type == 'brick_count') {
    const newpos = moveRaw(x, y, dir, core.ws.world)
    if (!newpos) {
      return cond.negated ? true : false
    } else {
      const count = core.ws.world.bricks[newpos.y][newpos.x]
      return cond.negated ? count != cond.count! : count == cond.count!
    }
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

export function abort(core: Core) {
  core.mutateWs(({ ui }) => {
    ui.isManualAbort = true
  })
  endExecution(core)
}

export function endExecution(core: Core) {
  clearTimeout(core.ws.vm.handler!)
  core.mutateWs((state) => {
    if (!core.ws.ui.karolCrashMessage) {
      state.ui.gutter = 0
    }
    state.ui.state = 'ready'
    state.vm.pc = 0
    state.vm.handler = undefined
    state.ui.gutterReturns = []
    state.ui.isEndOfRun = true
  })

  if (
    core.ws.quest.id > 0 &&
    !core.ws.ui.isManualAbort &&
    !core.ws.quest.progress
  ) {
    submitSolution(
      core,
      core.ws.quest.id,
      (core.ws.settings.mode == 'code' ? '//code-tab\n' : '') +
        core.ws.code +
        '\n// attempt //'
    )
  }
  /*if (
    !core.ws.ui.isManualAbort &&
    core.ws.quest.progress < 100 &&
    core.ws.ui.isTesting
  ) {
    //alert('Programm hat Auftrag nicht erfüllt. Überprüfung abgebrochen.')
    editCodeAndResetProgress(core)
  }
  if (core.ws.ui.karolCrashMessage) {
    editCodeAndResetProgress(core)
  }*/

  if (core.executionEndCallback) {
    const cb = core.executionEndCallback
    core.executionEndCallback = undefined
    cb()
  }
}
