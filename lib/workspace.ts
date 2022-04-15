import { EditorView } from '@codemirror/view'
import { Draft } from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import { compile } from './compiler'
import { Core, createWorld, useCore } from './core'
import { Condition, Heading, Speed, WorkspaceState, World } from './types'

export function useWorkspace() {
  const core = useCore()
  const workspaceIndex = core.state.currentWorkspace
  if (workspaceIndex >= 0 && workspaceIndex < core.state.workspaces.length) {
    return new Workspace(core.state.workspaces[workspaceIndex], core)
    if (core.workspaces[workspaceIndex]) {
      console.log('reuse existing workspace')
      return core.workspaces[workspaceIndex]
    } else {
      console.log('create new workspace')
      core.workspaces[workspaceIndex] = new Workspace(
        core.state.workspaces[workspaceIndex],
        core
      )
      return core.workspaces[workspaceIndex]
    }
  }
  throw new Error('Invalid index to workspace!')
}

export class Workspace {
  _core: Core
  state: WorkspaceState

  constructor(state: WorkspaceState, core: Core) {
    this.state = state
    this._core = core
  }

  // proxy call to core, workspace aware
  mutate(updater: (draft: Draft<WorkspaceState>) => void) {
    this._core.mutate((state) => {
      updater(state.workspaces[state.currentWorkspace])
    })
  }

  forward(opts?: { reverse: boolean }) {
    const { world } = this.state
    const { karol, bricks } = world
    const dir = opts?.reverse ? reverse(karol.dir) : karol.dir
    const target = move(karol.x, karol.y, dir, world)
    if (target) {
      const currentBrickCount = bricks[karol.y][karol.x]
      const targetBrickCount = bricks[target.y][target.x]

      if (Math.abs(currentBrickCount - targetBrickCount) > 1) {
        this.addMessage('Karol kann diese Höhe nicht überwinden.')
      } else {
        this.mutate(({ world }) => {
          world.karol.x = target.x
          world.karol.y = target.y
        })
        return true
      }
    } else {
      this.addMessage('Karol kann sich nicht in diese Richtung bewegen.')
    }
    return false
  }

  left() {
    this.mutate(({ world }) => {
      world.karol.dir = turnLeft(world.karol.dir)
    })
  }

  right() {
    this.mutate(({ world }) => {
      world.karol.dir = turnRight(world.karol.dir)
    })
  }

  brick() {
    const { world } = this.state
    const { karol, bricks, height } = world
    const pos = move(karol.x, karol.y, karol.dir, world)

    if (pos) {
      if (bricks[pos.y][pos.x] >= height) {
        this.addMessage('Maximale Stapelhöhe erreicht.')
        return false
      } else {
        this.mutate((state) => {
          state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] + 1
        })
        return true
      }
    } else {
      this.addMessage('Karol kann hier keinen Ziegel aufstellen.')
      return false
    }
  }

  unbrick() {
    const { world } = this.state
    const { karol, bricks } = world
    const pos = move(karol.x, karol.y, karol.dir, world)

    if (pos) {
      if (bricks[pos.y][pos.x] <= 0) {
        this.addMessage('Keine Ziegel zum Aufheben')
        return false
      } else {
        this.mutate((state) => {
          state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] - 1
        })
        return true
      }
    } else {
      this.addMessage('Karol kann hier keine Ziegel aufheben.')
      return false
    }
  }

  toggleMark() {
    this.mutate(({ world }) => {
      world.marks[world.karol.y][world.karol.x] =
        !world.marks[world.karol.y][world.karol.x]
    })
    this.checkChipActive()
  }

  setMark() {
    this.mutate(({ world }) => {
      world.marks[world.karol.y][world.karol.x] = true
    })
    this.checkChipActive()
  }

  resetMark() {
    this.mutate(({ world }) => {
      world.marks[world.karol.y][world.karol.x] = false
    })
  }

  checkChipActive() {
    const { world } = this.state
    const { karol, chips } = world
    for (const chip of chips) {
      if (chip.type == 'inverter') {
        if (
          karol.x == chip.x + 2 &&
          karol.y == chip.y + 2 &&
          world.marks[karol.y][karol.x]
        ) {
          const input = world.bricks[chip.y + 1][chip.x]
          const output = world.bricks[chip.y + 1][chip.x + 4]
          if ((input == 1 && output == 0) || (input == 0 && output == 1)) {
            this.mutate(({ ui }) => {
              ui.progress++
            })
            const val = Math.random() < 0.5
            this.mutate(({ world }) => {
              world.bricks[chip.y + 1][chip.x] = val ? 1 : 0
            })
            this.addMessage(
              'Inverter: Korrekte Belegung! Neue Eingabe gesetzt.'
            )
          } else {
            this.addMessage(
              'Inverter: Falsche Belegung! Fortschritt zurückgesetzt.'
            )
            this.mutate(({ ui }) => {
              ui.progress = 0
            })
            this.mutate(({ world }) => {
              world.marks[karol.y][karol.x] = false
            })
          }
        }
      }
    }
  }

  toggleBlock() {
    const { world } = this.state
    const { karol, blocks, bricks, marks } = world
    const pos = moveRaw(karol.x, karol.y, karol.dir, world)
    if (pos) {
      if (blocks[pos.y][pos.x]) {
        this.mutate(({ world }) => {
          world.blocks[pos.y][pos.x] = false
        })
        return true
      } else if (!marks[pos.y][pos.x] && bricks[pos.y][pos.x] == 0) {
        this.mutate(({ world }) => {
          world.blocks[pos.y][pos.x] = true
        })
        return true
      } else {
        if (marks[pos.y][pos.x]) {
          this.addMessage('Karol kann keinen Quader auf eine Marke stellen.')
        } else {
          this.addMessage('Karol kann keinen Quader auf Ziegel stellen.')
        }
      }
    } else {
      this.addMessage('Karol kann hier keinen Quader aufstellen.')
    }
    return false
  }

  createWorld(x: number, y: number, z: number) {
    this.mutate((state) => {
      state.world = createWorld(x, y, z)
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

  // give core a reference to editor view
  injectEditorView(view: EditorView) {
    this._core.injectEditorView(view)
  }

  // access editor view instance - if present
  get view() {
    return this._core.view
  }

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
            core.forward()
          }
          if (op.command == 'left') {
            core.left()
          }
          if (op.command == 'right') {
            core.right()
          }
          if (op.command == 'brick') {
            core.brick()
          }
          if (op.command == 'unbrick') {
            core.unbrick()
          }
          if (op.command == 'setMark') {
            core.setMark()
          }
          if (op.command == 'resetMark') {
            core.resetMark()
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

function move(x: number, y: number, dir: Heading, world: World) {
  const pos = moveRaw(x, y, dir, world)
  if (pos && !world.blocks[pos.y][pos.x]) {
    return pos
  }
}

function moveRaw(x: number, y: number, dir: Heading, world: World) {
  if (dir == 'east') {
    if (x + 1 < world.dimX) {
      return { x: x + 1, y }
    }
  }
  if (dir == 'west') {
    if (x > 0) {
      return { x: x - 1, y }
    }
  }
  if (dir == 'south') {
    if (y + 1 < world.dimY) {
      return { x, y: y + 1 }
    }
  }
  if (dir == 'north') {
    if (y > 0) {
      return { x, y: y - 1 }
    }
  }
}

function reverse(h: Heading) {
  return { north: 'south', south: 'north', east: 'west', west: 'east' }[
    h
  ] as Heading
}

function turnLeft(h: Heading) {
  return {
    north: 'west',
    west: 'south',
    south: 'east',
    east: 'north',
  }[h] as Heading
}

function turnRight(h: Heading) {
  return {
    north: 'east',
    east: 'south',
    south: 'west',
    west: 'north',
  }[h] as Heading
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
