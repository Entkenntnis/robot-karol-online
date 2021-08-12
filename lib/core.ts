import {
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import produce, { Draft } from 'immer'

import { EditorView } from '@codemirror/view'

import { Condition, CoreRefs, CoreState, Heading, Speed, World } from './types'
import { compile } from './compiler'

// set up core within app
export function useCreateCore() {
  const [coreState, setCoreState] = useState<CoreState>(() =>
    getDefaultCoreState()
  )
  const coreRef = useRef<CoreRefs>({ state: coreState })
  return useMemo(() => new Core(setCoreState, coreRef), [])
}

const CoreContext = createContext<Core | null>(null)

// access to core
export function useCore() {
  const val = useContext(CoreContext)
  if (val) {
    return val
  }
  throw new Error('Bad usage of core state')
}

// wrap App
export const CoreProvider = CoreContext.Provider

class Core {
  setCoreState: Dispatch<SetStateAction<CoreState>>
  coreRef: MutableRefObject<CoreRefs>

  constructor(
    setCoreState: Dispatch<SetStateAction<CoreState>>,
    coreRef: MutableRefObject<CoreRefs>
  ) {
    this.setCoreState = setCoreState
    this.coreRef = coreRef
  }

  // async-safe way to access core state
  get state() {
    return this.coreRef.current.state
  }

  // always mutate core state with this function
  mutate(updater: (draft: Draft<CoreState>) => void) {
    const newState = produce(this.state, updater)
    this.coreRef.current.state = newState
    this.setCoreState(newState)
  }

  // give core a reference to editor view
  injectEditorView(view: EditorView) {
    this.coreRef.current.view = view
  }

  // access editor view instance - if present
  get view() {
    return this.coreRef.current.view
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
  }

  setMark() {
    this.mutate(({ world }) => {
      world.marks[world.karol.y][world.karol.x] = true
    })
  }

  resetMark() {
    this.mutate(({ world }) => {
      world.marks[world.karol.y][world.karol.x] = false
    })
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

  lint() {
    if (this.state.ui.state == 'running' || !this.view) {
      return [] // auto formatting, ignore
    }
    // good place to sync code with state
    const code = this.view.state.doc.sliceString(0)
    this.mutate((state) => {
      state.code = code
    })

    const { warnings, output } = compile(this.view)

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
    return warnings
  }

  setLoading() {
    if (this.state.ui.state == 'running') {
      return // auto formatting, ignore
    }
    this.mutate(({ ui, vm }) => {
      ui.state = 'loading'
      vm.checkpoint = undefined
    })
  }

  restoreWorld() {
    this.mutate((state) => {
      if (state.ui.originalWorld) {
        state.world = state.ui.originalWorld
      }
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
      this.mutate((state) => {
        state.ui.gutter = op.line
      })

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
        this.mutate(({ vm, ui }) => {
          vm.callstack.push(vm.pc + 1)
          vm.frames.push({})
          vm.pc = op.target
          ui.gutterReturns.push(op.line)
        })
        const h = setTimeout(() => {
          core.step()
        }, 0)
        this.mutate(({ vm }) => {
          vm.handler = h
        })
        return
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
      this.abort()
      this.mutate((state) => {
        state.world = world
        state.code = code
        state.ui.needTextRefresh = true
        state.ui.originalWorld = world
        state.ui.filename = filename
      })
    } catch (e) {
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

  toggleWireframe() {
    this.mutate(({ ui }) => {
      ui.wireframe = !ui.wireframe
    })
  }
}

// ----- pure helper functions

function getDefaultCoreState(): CoreState {
  return {
    world: createWorld(5, 10, 6),
    code: '',
    ui: {
      messages: [],
      gutter: 0,
      gutterReturns: [],
      state: 'loading',
      needTextRefresh: false,
      wireframe: false,
    },
    vm: { pc: 0, entry: 0, frames: [{}], callstack: [] },
    settings: {
      speed: 'fast',
    },
  }
}

function createWorld(dimX: number, dimY: number, height: number): World {
  return {
    dimX,
    dimY,
    height,
    karol: {
      x: 0,
      y: 0,
      dir: 'south',
    },
    bricks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(0)),

    marks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
    blocks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
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
