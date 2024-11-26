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

type MarkerMode = 'lastExecuted' | 'currentlyExecuting' | 'newOnCallStack'

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
    // add a fixed 150ms delay between reset and first action, from then on the delay is defined by slider value
    vm.startTime = Date.now() - sliderToDelay(core.ws.ui.speedSliderValue) + 150
    vm.steps = 0
    ui.gutter = 0
    if (core.ws.ui.speedSliderValue == 0) {
      vm.isDebugging = true
    } else {
      vm.isDebugging = false
    }
  })

  // markPC(core, 'lastExecuted')
  const generator = executeProgramAsGenerator(core)
  if (core.ws.vm.isDebugging) {
    generator.next()
  }
  pulse(core, generator)
}

function pulse(
  core: Core,
  generator: ReturnType<typeof executeProgramAsGenerator>
) {
  if (core.ws.ui.state !== 'running' || !core.ws.vm.startTime) {
    return // program has been terminated or aborted
  }

  if (core.ws.vm.isDebugging) {
    if (core.ws.vm.debuggerRequestNextStep) {
      core.mutateWs((ws) => {
        ws.vm.debuggerRequestNextStep = false
      })
      const result = generator.next()
      if (result.done) {
        return // generator exhausted
      } else {
        core.mutateWs(({ vm }) => {
          vm.steps++
        })
      }
    }
  } else {
    // trying to call
    const delay = sliderToDelay(core.ws.ui.speedSliderValue)
    //console.log(delay)

    const elapsedTime = Date.now() - core.ws.vm.startTime

    const targetStep = Math.floor(elapsedTime / delay)

    let stepsInThisLoop = 0

    while (core.ws.vm.steps < targetStep && core.ws.ui.state == 'running') {
      const result = generator.next()
      if (result.done) {
        return // generator exhausted
      } else {
        core.mutateWs(({ vm }) => {
          vm.steps++
        })
      }

      if (core.ws.vm.isDebugging) {
        break
      }

      stepsInThisLoop++

      if (stepsInThisLoop > 25) {
        core.mutateWs(({ vm }) => {
          vm.startTime = Date.now() - vm.steps * delay // maximal skipping reached
        })
        console.log('maximum skipping')
        break
      }
    }
  }
  requestAnimationFrame(() => {
    pulse(core, generator)
  })
}

function markPC(core: Core, mode: MarkerMode) {
  if (core.ws.vm.bytecode && core.ws.ui.state == 'running') {
    const op =
      core.ws.vm.bytecode[
        mode === 'lastExecuted'
          ? core.ws.vm.pc - 1
          : mode === 'currentlyExecuting'
          ? core.ws.vm.pc
          : core.ws.vm.callstack[core.ws.vm.callstack.length - 1] - 1
      ]
    if (op?.line) {
      const line = op.line
      core.mutateWs(({ ui }) => {
        ui.gutter = line
      })
    }
  }
}

function* executeProgramAsGenerator(core: Core) {
  const byteCode = core.ws.vm.bytecode
  const state = core.ws.ui.state

  // console.log(byteCode)

  if (state != 'running') {
    throw new Error('internal step assumes running state')
  }

  if (!byteCode)
    throw new Error("Invalid bytecode, shouldn't be in running state")

  let stepCounter = 0
  let lastScannedLine = 0

  for (;;) {
    const pc = core.ws.vm.pc
    if (stepCounter++ >= 100) {
      console.log('possible dead loop')
      yield 'interrupt'
      stepCounter = 0
    }

    if (pc >= byteCode.length) {
      // regression: minimal run time for empty program

      endExecution(core)

      // end reached
      return 'end'
    }

    const op = byteCode[pc]

    if (!core.ws.vm.isDebugging) {
      if (op.line !== undefined) {
        const currentLine = op.line
        for (
          let i = lastScannedLine >= 0 ? lastScannedLine + 1 : currentLine;
          i <= currentLine;
          i++
        ) {
          if (core.ws.ui.breakpoints.includes(i)) {
            core.mutateWs((ws) => {
              ws.vm.isDebugging = true
            })
            if (op.type !== 'action') {
              markPC(core, 'currentlyExecuting')
              yield 'debugger'
            }
          }
        }
        lastScannedLine = currentLine
      }
    }

    if (op.type == 'action') {
      let repetitions = 1
      if (op.useParameterFromStack) {
        core.mutateWs(({ vm }) => {
          const frame = vm.frames[vm.frames.length - 1]
          repetitions = frame.opstack.pop() ?? 1
        })
      }
      markPC(core, 'currentlyExecuting')
      for (let i = 0; i < repetitions; i++) {
        if (core.ws.vm.isDebugging) {
          yield 'await'
        }
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
          return 'end' // something went wrong
        }
        if (!core.ws.vm.isDebugging) {
          yield 'delay'
        }
        stepCounter = 0
      }
      core.mutateWs(({ vm }) => {
        vm.pc++
      })
    } else {
      // execute ops that are have no side-effects and are not interruptable
      core.mutateWs(({ vm }) => {
        const frame = vm.frames[vm.frames.length - 1]

        // console.log('step', pc, op.type, [...frame.opstack]) // DEBUG

        switch (op.type) {
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
            lastScannedLine = -1
            break
          }
          case 'branch': {
            const arg = frame.opstack.pop()
            const target = arg == 0 ? op.targetF : op.targetT
            vm.pc = target
            lastScannedLine = -1
            break
          }
          case 'call': {
            vm.callstack.push(vm.pc + 1)
            const opstack: number[] = []
            if (op.arguments) {
              for (let i = 0; i < op.arguments; i++) {
                opstack.push(frame.opstack.pop() ?? 0)
              }
            }
            opstack.reverse()
            vm.frames.push({ opstack, variables: {} })
            vm.pc = op.target
            lastScannedLine = -1
            //markerMode = 'newOnCallStack'
            break
          }
          case 'return': {
            const target = vm.callstack.pop()
            vm.frames.pop()
            vm.pc = target ?? Infinity
            lastScannedLine = -1
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
          case 'compare': {
            const b = frame.opstack.pop() ?? NaN
            const a = frame.opstack.pop() ?? NaN
            switch (op.kind) {
              case 'equal': {
                frame.opstack.push(a == b ? 1 : 0)
                break
              }
              case 'unequal': {
                frame.opstack.push(a != b ? 1 : 0)
                break
              }
              case 'greater-equal': {
                frame.opstack.push(a >= b ? 1 : 0)
                break
              }
              case 'greater-than': {
                frame.opstack.push(a > b ? 1 : 0)
                break
              }
              case 'less-than': {
                frame.opstack.push(a < b ? 1 : 0)
                break
              }
              case 'less-equal': {
                frame.opstack.push(a <= b ? 1 : 0)
                break
              }
            }
            vm.pc++
            break
          }
        }
      })
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
  // update gutter after crash to show line that caused the crash
  if (
    core.ws.ui.karolCrashMessage &&
    core.ws.vm.bytecode &&
    core.ws.vm.bytecode[core.ws.vm.pc - 1] &&
    core.ws.vm.bytecode[core.ws.vm.pc - 1].line
  ) {
    core.mutateWs(({ ui }) => {
      ui.gutter = core.ws.vm.bytecode![core.ws.vm.pc - 1].line!
    })
  }

  core.mutateWs((state) => {
    if (!core.ws.ui.karolCrashMessage) {
      state.ui.gutter = 0
    }
    state.ui.state = 'ready'
    state.vm.pc = 0
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
