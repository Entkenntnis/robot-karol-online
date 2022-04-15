import { EditorView } from '@codemirror/view'
import { Draft } from 'immer'
import { WritableDraft } from 'immer/dist/internal'

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
} from './commands/world'
import { compile } from './language/compiler'
import { Core, useCore } from './state/core'
import { Condition, Speed, WorkspaceState, World } from './state/types'

export function useWorkspace() {
  const core = useCore()
  const workspaceIndex = core.state.currentWorkspace
  if (workspaceIndex >= 0 && workspaceIndex < core.state.workspaces.length) {
    return new Workspace(core)
  }
  throw new Error('Invalid index to workspace!')
}

export class Workspace {
  _core: Core

  constructor(core: Core) {
    this._core = core
  }

  get state() {
    return this._core.state.workspaces[this._core.state.currentWorkspace]
  }

  // proxy call to core, workspace aware
  mutate(updater: (draft: Draft<WorkspaceState>) => void) {
    this._core.mutateCore((state) => {
      updater(state.workspaces[state.currentWorkspace])
    })
  }

  // show message that something didn't work out - auto-stacking and hiding
  addMessage(text: string) {
    const ts = Date.now()
    this.mutate(({ ui }) => {
      while (ui.messages.length >= 5) {
        ui.messages.shift()
      }
      const lastIndex = ui.messages.length - 1
      if (lastIndex >= 0 && ui.messages[lastIndex].text == text) {
        ui.messages[lastIndex].count++
      } else {
        ui.messages.push({ text, ts, count: 1 })
      }
    })
    setTimeout(() => {
      this.mutate(({ ui }) => {
        ui.messages = ui.messages.filter((m) => m.ts != ts)
      })
    }, 2500)
  }

  toggleWireframe() {
    this.mutate(({ ui }) => {
      ui.wireframe = !ui.wireframe
    })
  }

  restoreWorld() {
    this.mutate((state) => {
      if (state.ui.originalWorld) {
        state.world = state.ui.originalWorld
      }
    })
  }

  // -- next part

  lint(view: EditorView) {
    if (this.state.ui.state == 'running' || !view) {
      return [] // auto formatting, ignore
    }
    // good place to sync code with state
    const code = view.state.doc.sliceString(0)
    this.mutate((state) => {
      state.code = code
    })

    console.log('lint')

    const { warnings, output } = compile(view)

    if (warnings.length == 0) {
      this.mutate(({ vm, ui }) => {
        vm.bytecode = output
        vm.pc = 0
        ui.state = 'ready'
      })
    } else {
      this.mutate(({ vm, ui }) => {
        vm.bytecode = undefined
        vm.pc = 0
        ui.state = 'error'
      })
    }

    console.log('lint done')
    return warnings
  }

  setLoading() {
    if (this.state.ui.state == 'running') {
      return // auto formatting, ignore
    }
    this.mutate(({ ui, vm }) => {
      console.log('set loading')
      ui.state = 'loading'
      vm.checkpoint = undefined
    })
  }

  run() {
    this.mutate(({ ui, vm }) => {
      ui.state = 'running'
      vm.checkpoint = this.state.world
      vm.pc = vm.entry
      vm.frames = [{}]
      ui.gutterReturns = []
    })
    //console.log(this.current.vm.bytecode)
    setTimeout(this.step.bind(this), 500)
  }

  step() {
    const pc = this.state.vm.pc
    const byteCode = this.state.vm.bytecode
    const state = this.state.ui.state

    if (!byteCode || state != 'running') {
      // ignore
      return
    }
    if (pc >= byteCode.length) {
      // end reached
      this.abort()
      return
    }
    const op = byteCode[pc]
    const core = this

    /*console.log(
      'step',
      pc,
      op,
      this.current.vm.counter,
      this.current.vm.callstack
    )*/

    console.log(this.state.ui.gutterReturns)

    if (op.type == 'action') {
      /*this.mutate((state) => {
        state.ui.gutter = op.line
      })*/

      const delay =
        this.state.settings.speed == 'slow'
          ? 500
          : this.state.settings.speed == 'fast'
          ? 50
          : 0

      const h = setTimeout(() => {
        if (op.type == 'action') {
          if (op.command == 'forward') {
            forward(this._core)
          }
          if (op.command == 'left') {
            left(this._core)
          }
          if (op.command == 'right') {
            right(this._core)
          }
          if (op.command == 'brick') {
            brick(this._core)
          }
          if (op.command == 'unbrick') {
            unbrick(this._core)
          }
          if (op.command == 'setMark') {
            setMark(this._core)
          }
          if (op.command == 'resetMark') {
            resetMark(this._core)
          }
          core.mutate((state) => {
            state.vm.pc++
            setGutter(state)
          })
          if (this.state.settings.speed !== 'step') {
            const h = setTimeout(() => core.step(), delay)
            this.mutate(({ vm }) => {
              vm.handler = h
            })
            return
          }
        }
      }, delay)
      this.mutate(({ vm }) => {
        vm.handler = h
      })
    } else {
      if (op.type == 'jumpn') {
        this.mutate(({ vm }) => {
          const frame = vm.frames[vm.frames.length - 1]
          if (frame[pc] === undefined) {
            frame[pc] = op.count
          }
        })
        const frame = this.state.vm.frames[this.state.vm.frames.length - 1]
        if (frame[pc] == 0) {
          core.mutate((state) => {
            const frame = state.vm.frames[state.vm.frames.length - 1]
            state.vm.pc++
            delete frame[pc]
          })
          const h = setTimeout(() => {
            core.step()
          }, 0)
          this.mutate(({ vm }) => {
            vm.handler = h
          })
          return
        } else {
          core.mutate((state) => {
            const frame = state.vm.frames[state.vm.frames.length - 1]
            state.vm.pc = op.target
            frame[pc]--
          })
          const h = setTimeout(() => {
            core.step()
          }, 0)
          this.mutate(({ vm }) => {
            vm.handler = h
          })
          return
        }
      }
      if (op.type == 'jumpcond') {
        const flag = this.testCondition(op.condition)
        this.mutate((state) => {
          state.vm.pc = flag ? op.targetT : op.targetF
        })
        const h = setTimeout(() => {
          core.step()
        }, 0)
        this.mutate(({ vm }) => {
          vm.handler = h
        })
        return
      }
      if (op.type == 'call') {
        this.mutate((state) => {
          const { vm, ui } = state
          vm.callstack.push(vm.pc + 1)
          vm.frames.push({})
          vm.pc = op.target
          ui.gutterReturns.push(op.line)
          setGutter(state)
        })
        if (this.state.settings.speed !== 'step') {
          const h = setTimeout(() => core.step(), 0)
          this.mutate(({ vm }) => {
            vm.handler = h
          })
          return
        }
      }
      if (op.type == 'return') {
        this.mutate(({ vm, ui }) => {
          ui.gutterReturns.pop()
          const target = vm.callstack.pop()
          vm.frames.pop()
          vm.pc = target ?? Infinity
        })
        const h = setTimeout(() => {
          core.step()
        }, 0)
        this.mutate(({ vm }) => {
          vm.handler = h
        })
        return
      }
    }
  }

  testCondition(cond: Condition) {
    const { x, y, dir } = this.state.world.karol
    if (cond.type == 'mark') {
      const val = this.state.world.marks[y][x]
      if (cond.negated) {
        return !val
      }
      return val
    } else if (cond.type == 'wall') {
      const newpos = move(x, y, dir, this.state.world)
      if (cond.negated) {
        return !!newpos
      }
      return !newpos
    } else {
      const newpos = moveRaw(x, y, dir, this.state.world)
      if (!newpos) {
        return cond.negated ? true : false
      } else {
        const count = this.state.world.bricks[newpos.y][newpos.x]
        return cond.negated ? count == 0 : count > 0
      }
    }
  }

  serialize() {
    const { world, code } = this.state
    return { world, code }
  }

  deserialize(file?: string, filename?: string) {
    try {
      const { world, code }: { world: World; code: string } = JSON.parse(
        file ?? '{}'
      )
      if (!world || code === undefined) {
        throw new Error('Datei unvollständig')
      }
      // minimal sanity check
      if (!world.dimX || !world.dimY || !world.height) {
        throw new Error('Welt beschädigt')
      }
      if (world.dimX > 100 || world.dimY > 100 || world.height > 10) {
        throw new Error('Welt ungültig')
      }
      for (let x = 0; x < world.dimX; x++) {
        for (let y = 0; y < world.dimY; y++) {
          if (
            typeof world.blocks[y][x] !== 'boolean' ||
            world.bricks[y][x] === undefined ||
            world.bricks[y][x] < 0 ||
            world.bricks[y][x] > world.height ||
            typeof world.marks[y][x] != 'boolean'
          ) {
            throw new Error('Welt enthält ungültigen Wert')
          }
        }
      }
      if (!world.chips) {
        // patch old save files
        world.chips = []
      }
      this.abort()
      this.mutate((state) => {
        state.world = world
        state.code = code
        state.ui.needTextRefresh = true
        state.ui.originalWorld = world
        state.ui.filename = filename
      })
    } catch (e) {
      // @ts-ignore don't know why this suddenly fails
      alert(e.message ?? 'Laden fehlgeschlagen')
    }
  }

  refreshDone() {
    this.mutate((state) => {
      state.ui.needTextRefresh = false
    })
  }
  setSpeedHot(val: string) {
    clearTimeout(this.state.vm.handler!)
    this.setSpeed(val)
    if (val != 'step' && this.state.ui.state == 'running') {
      this.step()
    }
  }

  setSpeed(val: string) {
    this.mutate((state) => {
      state.settings.speed = val as Speed
    })
  }

  abort() {
    clearTimeout(this.state.vm.handler!)
    this.mutate((state) => {
      state.ui.gutter = 0
      state.ui.state = 'ready'
      state.vm.pc = 0
      state.vm.handler = undefined
    })
  }

  resetCheckpoint() {
    this.mutate(({ vm }) => {
      vm.checkpoint = undefined
    })
  }
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
