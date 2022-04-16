import { EditorView } from '@codemirror/view'
import { WritableDraft } from 'immer/dist/internal'

import { compile } from '../language/compiler'
import { Core } from '../state/core'
import { Condition, Speed, WorkspaceState } from '../state/types'
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

export function lint(core: Core, view: EditorView) {
  if (core.ws.ui.state == 'running' || !view) {
    return [] // auto formatting, ignore
  }
  // good place to sync code with state
  const code = view.state.doc.sliceString(0)
  core.mutateWs((state) => {
    state.code = code
  })

  console.log('lint')

  const { warnings, output } = compile(view)

  if (warnings.length == 0) {
    core.mutateWs(({ vm, ui }) => {
      vm.bytecode = output
      vm.pc = 0
      ui.state = 'ready'
    })
  } else {
    core.mutateWs(({ vm, ui }) => {
      vm.bytecode = undefined
      vm.pc = 0
      ui.state = 'error'
    })
  }

  console.log('lint done')
  return warnings
}

export function setLoading(core: Core) {
  if (core.ws.ui.state == 'running') {
    return // auto formatting, ignore
  }
  core.mutateWs(({ ui, vm }) => {
    console.log('set loading')
    ui.state = 'loading'
    vm.checkpoint = undefined
  })
}

export function run(core: Core) {
  core.mutateWs(({ ui, vm }) => {
    ui.state = 'running'
    vm.checkpoint = core.ws.world
    vm.pc = vm.entry
    vm.frames = [{}]
    ui.gutterReturns = []
  })
  //console.log(this.current.vm.bytecode)
  setTimeout(() => step(core), 500)
}

export function step(core: Core) {
  const pc = core.ws.vm.pc
  const byteCode = core.ws.vm.bytecode
  const state = core.ws.ui.state

  if (!byteCode || state != 'running') {
    // ignore
    return
  }
  if (pc >= byteCode.length) {
    // end reached
    abort(core)
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

  //console.log(this.state.ui.gutterReturns)

  if (op.type == 'action') {
    /*this.mutate((state) => {
      state.ui.gutter = op.line
    })*/

    const delay =
      core.ws.settings.speed == 'slow'
        ? 500
        : core.ws.settings.speed == 'fast'
        ? 50
        : 0

    const h = setTimeout(() => {
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
          setGutter(state)
        })
        if (core.ws.settings.speed !== 'step') {
          const h = setTimeout(() => step(core), delay)
          core.mutateWs(({ vm }) => {
            vm.handler = h
          })
          return
        }
      }
    }, delay)
    core.mutateWs(({ vm }) => {
      vm.handler = h
    })
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
        const h = setTimeout(() => {
          step(core)
        }, 0)
        core.mutateWs(({ vm }) => {
          vm.handler = h
        })
        return
      } else {
        core.mutateWs((state) => {
          const frame = state.vm.frames[state.vm.frames.length - 1]
          state.vm.pc = op.target
          frame[pc]--
        })
        const h = setTimeout(() => {
          step(core)
        }, 0)
        core.mutateWs(({ vm }) => {
          vm.handler = h
        })
        return
      }
    }
    if (op.type == 'jumpcond') {
      const flag = testCondition(core, op.condition)
      core.mutateWs((state) => {
        state.vm.pc = flag ? op.targetT : op.targetF
      })
      const h = setTimeout(() => {
        step(core)
      }, 0)
      core.mutateWs(({ vm }) => {
        vm.handler = h
      })
      return
    }
    if (op.type == 'call') {
      core.mutateWs((state) => {
        const { vm, ui } = state
        vm.callstack.push(vm.pc + 1)
        vm.frames.push({})
        vm.pc = op.target
        ui.gutterReturns.push(op.line)
        setGutter(state)
      })
      if (core.ws.settings.speed !== 'step') {
        const h = setTimeout(() => step(core), 0)
        core.mutateWs(({ vm }) => {
          vm.handler = h
        })
        return
      }
    }
    if (op.type == 'return') {
      core.mutateWs(({ vm, ui }) => {
        ui.gutterReturns.pop()
        const target = vm.callstack.pop()
        vm.frames.pop()
        vm.pc = target ?? Infinity
      })
      const h = setTimeout(() => {
        step(core)
      }, 0)
      core.mutateWs(({ vm }) => {
        vm.handler = h
      })
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

export function refreshDone(core: Core) {
  core.mutateWs((state) => {
    state.ui.needTextRefresh = false
  })
}
export function setSpeedHot(core: Core, val: string) {
  clearTimeout(core.ws.vm.handler!)
  setSpeed(core, val)
  if (val != 'step' && core.ws.ui.state == 'running') {
    step(core)
  }
}

export function setSpeed(core: Core, val: string) {
  core.mutateWs((state) => {
    state.settings.speed = val as Speed
  })
}

export function abort(core: Core) {
  clearTimeout(core.ws.vm.handler!)
  core.mutateWs((state) => {
    state.ui.gutter = 0
    state.ui.state = 'ready'
    state.vm.pc = 0
    state.vm.handler = undefined
  })
}

export function resetCheckpoint(core: Core) {
  core.mutateWs(({ vm }) => {
    vm.checkpoint = undefined
  })
}

function setGutter(state: WritableDraft<WorkspaceState>) {
  const pc = state.vm.pc
  if (state.vm.bytecode && pc < state.vm.bytecode.length) {
    const op = state.vm.bytecode[pc]
    if (op.type == 'action' || op.type == 'call') {
      state.ui.gutter = op.line
    }
  }
}
