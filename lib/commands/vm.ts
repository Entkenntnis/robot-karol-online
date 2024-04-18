import { sliderToDelay } from '../helper/speedSlider'
import { Core } from '../state/core'
import { ActionOp, Condition, Op } from '../state/types'
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
    ui.showJavaInfo = false
    ui.isManualAbort = false
    ui.isTestingAborted = false
    ui.isEndOfRun = false
    ui.karolCrashMessage = undefined
    vm.pc = 0
    vm.frames = [{ variables: {}, opstack: [] }]
    vm.callstack = []
    vm.startTime = Date.now()
    vm.steps = 1
    vm.repeatAction = undefined
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
  if (core.ws.vm.bytecode && core.ws.ui.state == 'running') {
    const op = core.ws.vm.bytecode[core.ws.vm.pc]
    if (op?.line) {
      const line = op.line
      core.mutateWs(({ ui }) => {
        ui.gutter = line
      })
    }
  }
}

function internal_step(core: Core) {
  const byteCode = core.ws.vm.bytecode
  const state = core.ws.ui.state

  if (state != 'running') {
    throw new Error('internal step assumes running state')
  }

  if (!byteCode)
    throw new Error("Invalid bytecode, shouldn't be in running state")

  let stepCounter = 0

  for (;;) {
    const pc = core.ws.vm.pc
    if (stepCounter++ >= 100) {
      console.log('possible dead loop')
      break
    }

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

    let sideEffectOp: ActionOp | null = null

    // console.log(delay)
    core.mutateWs(({ vm }) => {
      const frame = vm.frames[vm.frames.length - 1]

      // console.log('step', pc, op.type, [...frame.opstack])

      switch (op.type) {
        case 'action': {
          sideEffectOp = op
          if (op.useParameterFromStack) {
            if (vm.repeatAction === undefined) {
              const count = frame.opstack.pop() ?? 1
              if (count == 1) {
                vm.pc++ // edge case, no repeat necessary
              } else {
                vm.repeatAction = count - 2
              }
            } else if (vm.repeatAction > 0) {
              vm.repeatAction--
            } else {
              vm.repeatAction = undefined
              vm.pc++
            }
          } else {
            vm.pc++
          }
          break
        }
        case 'sense': {
          const condition: Condition = {
            type: op.condition.type,
            negated: op.condition.negated,
          }
          if (op.condition.type == 'brick_count') {
            condition.count = frame.opstack.pop()
          }
          frame.opstack.push(testCondition(core, condition) ? 1 : 0)
          vm.pc++
          break
        }
        case 'jump': {
          vm.pc = op.target
          break
        }
        case 'branch': {
          const arg = frame.opstack.pop()
          const target = arg == 0 ? op.targetF : op.targetT
          vm.pc = target
          break
        }
        case 'call': {
          vm.callstack.push(vm.pc + 1)
          vm.frames.push({ opstack: [], variables: {} })
          vm.pc = op.target
          break
        }
        case 'return': {
          const target = vm.callstack.pop()
          vm.frames.pop()
          vm.pc = target ?? Infinity
          break
        }
        case 'operation': {
          const b = frame.opstack.pop() ?? NaN
          const a = frame.opstack.pop() ?? NaN
          switch (op.kind) {
            case 'add': {
              frame.opstack.push(a + b)
              break
            }
            case 'sub': {
              frame.opstack.push(a - b)
              break
            }
            case 'mult': {
              frame.opstack.push(a * b)
              break
            }
            case 'div': {
              frame.opstack.push(Math.trunc(a / b))
              break
            }
          }
          vm.pc++
          break
        }
        case 'constant': {
          frame.opstack.push(op.value)
          vm.pc++
          break
        }
        case 'load': {
          frame.opstack.push(frame.variables[op.variable])
          vm.pc++
          break
        }
        case 'store': {
          frame.variables[op.variable] = frame.opstack.pop() ?? NaN
          vm.pc++
          break
        }
      }
    })

    if (sideEffectOp) {
      console.log('side effect op execution')
      const op = sideEffectOp as ActionOp
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
        return // something went wrong
      }
    }

    if (op.line) {
      break // update ui
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
  } else if (
    cond.type == 'north' ||
    cond.type == 'east' ||
    cond.type == 'south' ||
    cond.type == 'west'
  ) {
    if (cond.negated) {
      return dir !== cond.type
    } else {
      return dir == cond.type
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
    state.ui.isEndOfRun = true
  })

  /*if (
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
  }*/

  if (core.executionEndCallback) {
    const cb = core.executionEndCallback
    core.executionEndCallback = undefined
    cb()
  }
}
