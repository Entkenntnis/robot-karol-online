import { EditorView } from '@codemirror/view'
import produce from 'immer'
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
import { DraftFunction } from 'use-immer'
import { ensureSyntaxTree } from '@codemirror/language'
import { Diagnostic } from '@codemirror/lint'

export type Heading = 'north' | 'east' | 'south' | 'west'

export interface World {
  dimX: number
  dimY: number
  height: number
  karol: {
    x: number
    y: number
    dir: Heading
  }
  bricks: number[][]
  marks: boolean[][]
  blocks: boolean[][]
}

export interface Message {
  text: string
  count: number
  ts: number
}

export interface Ui {
  messages: Message[]
  gutter: number
  state: 'ready' | 'loading' | 'running' | 'error'
  needTextRefresh: boolean
  filename?: string
  originalWorld?: World
  wireframe: boolean
}

export interface Vm {
  bytecode?: Op[]
  pc: number
  entry: number
  checkpoint?: World
  handler?: NodeJS.Timeout
  frames: { [index: number]: number }[]
  callstack: number[]
}

export type Speed = 'slow' | 'fast' | 'step' | 'turbo'

export interface Settings {
  speed: Speed
}

export interface CoreState {
  world: World
  ui: Ui
  code: string
  vm: Vm
  settings: Settings
}

export interface ActionOp {
  type: 'action'
  command:
    | 'forward'
    | 'left'
    | 'right'
    | 'brick'
    | 'unbrick'
    | 'setMark'
    | 'resetMark'
  line: number
}

export interface Condition {
  type: 'brick' | 'mark' | 'wall'
  negated: boolean
}

export interface JumpNOp {
  type: 'jumpn'
  target: number
  count: number
}

export interface JumpCondOp {
  type: 'jumpcond'
  targetT: number
  targetF: number
  condition: Condition
}

export interface CallOp {
  type: 'call'
  target: number
}

export interface ReturnOp {
  type: 'return'
}

export type Op = ActionOp | JumpNOp | JumpCondOp | CallOp | ReturnOp

export function useCreateCore() {
  const [coreState, setCoreState] = useState<CoreState>(() =>
    getDefaultCoreState()
  )
  const coreStateRef = useRef<CoreState>(coreState)
  return useMemo(() => new Core(setCoreState, coreStateRef), [])
}

const CoreContext = createContext<Core | null>(null)

export function useCore() {
  const val = useContext(CoreContext)
  if (val) {
    return val
  }
  throw new Error('Bad usage of core state')
}

export const CoreProvider = CoreContext.Provider

class Core {
  setCoreState: Dispatch<SetStateAction<CoreState>>
  coreStateRef: MutableRefObject<CoreState>

  constructor(
    setCoreState: Dispatch<SetStateAction<CoreState>>,
    coreStateRef: MutableRefObject<CoreState>
  ) {
    this.setCoreState = setCoreState
    this.coreStateRef = coreStateRef
  }

  get current() {
    return this.coreStateRef.current
  }

  mutate(updater: DraftFunction<CoreState>) {
    const newState = produce(this.coreStateRef.current, updater)
    this.coreStateRef.current = newState
    this.setCoreState(newState)
  }

  forward(opts?: { reverse: boolean }) {
    const { world } = this.current
    const dir = opts?.reverse
      ? ({ north: 'south', south: 'north', east: 'west', west: 'east' }[
          world.karol.dir
        ] as Heading)
      : world.karol.dir
    const newPos = move(world.karol.x, world.karol.y, dir, world)
    if (newPos) {
      const myBricks = world.bricks[world.karol.y][world.karol.x]
      const newBricks = world.bricks[newPos.y][newPos.x]

      if (Math.abs(myBricks - newBricks) > 1) {
        this.addMessage('Karol kann diese Höhe nicht überwinden.')
      } else {
        this.mutate(({ world }) => {
          world.karol.x = newPos.x
          world.karol.y = newPos.y
        })
        return true
      }
    } else {
      this.addMessage('Karol kann sich nicht in diese Richtung bewegen.')
    }
    return false
  }

  left() {
    this.mutate((state) => {
      state.world.karol.dir = {
        north: 'west',
        west: 'south',
        south: 'east',
        east: 'north',
      }[state.world.karol.dir] as Heading
    })
  }

  right() {
    this.mutate((state) => {
      state.world.karol.dir = {
        north: 'east',
        east: 'south',
        south: 'west',
        west: 'north',
      }[state.world.karol.dir] as Heading
    })
  }

  brick() {
    const { world } = this.current
    const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

    if (pos) {
      if (world.bricks[pos.y][pos.x] >= world.height) {
        this.addMessage('Maximale Stapelhöhe erreicht.')
        return false
      } else {
        this.mutate((state) => {
          state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] + 1
        })
        return true
      }
    } else {
      this.addMessage('Karol kann dort keinen Ziegel aufstellen.')
      return false
    }
  }

  unbrick() {
    const { world } = this.current
    const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

    if (pos) {
      if (world.bricks[pos.y][pos.x] <= 0) {
        this.addMessage('Keine Ziegel zum Aufheben')
        return false
      } else {
        this.mutate((state) => {
          state.world.bricks[pos.y][pos.x] = world.bricks[pos.y][pos.x] - 1
        })
        return true
      }
    } else {
      this.addMessage('Karol kann dort keine Ziegel aufheben.')
      return false
    }
  }

  toggleMark() {
    this.mutate((state) => {
      const world = state.world
      world.marks[world.karol.y][world.karol.x] =
        !world.marks[world.karol.y][world.karol.x]
    })
  }

  setMark() {
    this.mutate((state) => {
      const world = state.world
      world.marks[world.karol.y][world.karol.x] = true
    })
  }

  resetMark() {
    this.mutate((state) => {
      const world = state.world
      world.marks[world.karol.y][world.karol.x] = false
    })
  }

  toggleBlock() {
    const { world } = this.current
    const pos = moveRaw(world.karol.x, world.karol.y, world.karol.dir, world)
    if (pos) {
      if (world.blocks[pos.y][pos.x]) {
        this.mutate((state) => {
          state.world.blocks[pos.y][pos.x] = false
        })
        return true
      } else if (
        !world.marks[pos.y][pos.x] &&
        world.bricks[pos.y][pos.x] == 0
      ) {
        this.mutate((state) => {
          state.world.blocks[pos.y][pos.x] = true
        })
        return true
      } else {
        if (world.marks[pos.y][pos.x]) {
          this.addMessage(
            'Karol kann keinen Quader aufstellen, vor ihm liegt eine Marke.'
          )
        } else {
          this.addMessage(
            'Karol kann keinen Quader aufstellen, vor ihm liegen Ziegel.'
          )
        }
      }
    } else {
      this.addMessage(
        'Karol kann keinen Quader aufstellen, er steht vor einer Wand.'
      )
    }
    return false
  }

  createWorld(x: number, y: number, z: number) {
    this.mutate((state) => {
      state.world = createWorld(x, y, z)
    })
  }

  addMessage(text: string) {
    const newMessages = this.current.ui.messages.slice(0)
    while (newMessages.length >= 5) {
      newMessages.shift()
    }
    const ts = Date.now()
    const lastMessage = newMessages[newMessages.length - 1]
    if (lastMessage?.text == text) {
      newMessages[newMessages.length - 1] = {
        text,
        ts,
        count: lastMessage.count + 1,
      }
    } else {
      newMessages.push({ text, ts, count: 1 })
    }
    this.mutate(({ ui }) => {
      ui.messages = newMessages
    })
    const core = this
    setTimeout(() => {
      core.mutate(({ ui }) => {
        ui.messages = ui.messages.filter((m) => m.ts != ts)
      })
    }, 2500)
  }

  lint(view: EditorView) {
    if (this.current.ui.state == 'running') {
      return [] // auto formatting, ignore
    }
    const code = view.state.doc.sliceString(0)
    this.mutate((state) => {
      state.code = code
    })
    const tree = ensureSyntaxTree(view.state, 1000000, 1000)
    const output: Op[] = []
    const warnings: Diagnostic[] = []
    const parseStack: any[] = []
    const functions: any[] = []
    const declarations: any = {}
    if (tree) {
      let cursor = tree.cursor()
      do {
        const code = view.state.doc.sliceString(cursor.from, cursor.to)
        //console.log(cursor.name)
        if (cursor.name == 'Command') {
          const line = view.state.doc.lineAt(cursor.from).number
          if (code == 'Schritt') {
            output.push({
              type: 'action',
              command: 'forward',
              line,
            })
          } else if (code == 'LinksDrehen') {
            output.push({
              type: 'action',
              command: 'left',
              line,
            })
          } else if (code == 'RechtsDrehen') {
            output.push({
              type: 'action',
              command: 'right',
              line,
            })
          } else if (code == 'Hinlegen') {
            output.push({
              type: 'action',
              command: 'brick',
              line,
            })
          } else if (code == 'Aufheben') {
            output.push({
              type: 'action',
              command: 'unbrick',
              line,
            })
          } else if (code == 'MarkeSetzen') {
            output.push({
              type: 'action',
              command: 'setMark',
              line,
            })
          } else if (code == 'MarkeLöschen') {
            output.push({
              type: 'action',
              command: 'resetMark',
              line,
            })
          } else if (code == 'Beenden') {
            // jump into the black hole
            output.push({
              type: 'jumpn',
              target: Infinity,
              count: Infinity,
            })
          } else if (code == 'Unterbrechen') {
            output.push({ type: 'return' })
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: `"${code}" ist kein bekannter Befehl`,
            })
          }
        }
        if (cursor.name == 'CustomRef') {
          const op: Op = { type: 'call', target: -1 }
          functions.push({ op, code, from: cursor.from, to: cursor.to })
          output.push(op)
        }
        if (cursor.name == 'Repeat') {
          parseStack.push({ type: 'repeat', from: cursor.from, stage: 0 })
        }
        if (cursor.name == 'RepeatStart') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'repeat' && st.stage == 0) {
            st.stage = 1
            const op: Op = { type: 'jumpn', target: -1, count: Infinity }
            output.push(op)
            st.op = op
            if (code !== 'wiederhole') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "wiederhole" fehlt',
              })
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Wiederholung',
            })
          }
        }
        if (cursor.name == 'RepeatWhileKey') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'repeat' && st.stage == 1) {
            st.stage = 10
            if (code !== 'solange') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "solange" fehlt',
              })
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Wiederholung',
            })
          }
        }
        if (cursor.name == 'Condition') {
          const st = parseStack[parseStack.length - 1]
          let cond: Condition = {} as Condition
          if (code == 'NichtIstWand') {
            cond = { type: 'wall', negated: true }
          } else if (code == 'IstWand') {
            cond = { type: 'wall', negated: false }
          } else if (code == 'NichtIstZiegel') {
            cond = { type: 'brick', negated: true }
          } else if (code == 'IstZiegel') {
            cond = { type: 'brick', negated: false }
          } else if (code == 'NichtIstMarke') {
            cond = { type: 'mark', negated: true }
          } else if (code == 'IstMarke') {
            cond = { type: 'mark', negated: false }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'unbekannte Bedingung',
            })
          }
          if (st && st.type == 'repeat' && st.stage == 10) {
            st.stage = 11
            st.start = output.length
            st.condition = cond
          } else if (st && st.type == 'if' && st.stage == 1) {
            st.condition = cond
            st.stage = 2
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Wiederholung',
            })
          }
        }
        if (cursor.name == 'IfThen') {
          parseStack.push({ type: 'if', from: cursor.from, stage: 0 })
        }
        if (cursor.name == 'IfKey') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'if' && st.stage == 0) {
            st.stage = 1
            if (code !== 'wenn') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "wenn" fehlt',
              })
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige bedingte Anweisung',
            })
          }
        }
        if (cursor.name == 'ThenKey') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'if' && st.stage == 2) {
            st.stage = 3
            if (code !== 'dann') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "dann" fehlt',
              })
            } else {
              const op: Op = {
                type: 'jumpcond',
                condition: st.condition,
                targetT: output.length + 1,
                targetF: -1,
              }
              output.push(op)
              st.op = op
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige bedingte Anweisung',
            })
          }
        }
        if (cursor.name == 'ElseKey') {
          const st = parseStack[parseStack.length - 1]
          if (st && st.type == 'if' && st.stage == 3) {
            if (code !== 'sonst') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "sonst" fehlt',
              })
            } else {
              st.op.targetF = output.length + 1
              const op: Op = { type: 'jumpn', count: Infinity, target: -1 }
              output.push(op)
              st.stage = 4
              st.op = op
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige bedingte Anweisung',
            })
          }
        }
        if (cursor.name == 'IfEndKey') {
          const st = parseStack[parseStack.length - 1]
          if (st && st.type == 'if') {
            if (code !== 'endewenn') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "endewenn" fehlt',
              })
            } else {
              if (st.stage == 3) {
                st.op.targetF = output.length
              } else if (st.stage == 4) {
                st.op.target = output.length
              }
              parseStack.pop()
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige bedingte Anweisung',
            })
          }
        }
        if (cursor.name == 'Times') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'repeat' && st.stage == 1) {
            st.stage++
            st.times = parseInt(code)
            if (!code || isNaN(st.times) || st.times < 1) {
              warnings.push({
                from: cursor.from - 3,
                to: Math.min(cursor.to + 3, view.state.doc.length - 1),
                severity: 'error',
                message:
                  'Anzahl der Wiederholung muss eine natürliche Zahl sein',
              })
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Wiederholung',
            })
          }
        }
        if (cursor.name == 'RepeatTimesKey') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'repeat' && st.stage == 2) {
            st.stage++
            st.start = output.length
            if (code !== 'mal') {
              warnings.push({
                from: st.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "mal" fehlt.',
              })
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Wiederholung',
            })
          }
        }
        if (cursor.name == 'RepeatEnd') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'repeat' && st.stage == 3) {
            st.op.target = output.length
            output.push({
              type: 'jumpn',
              count: st.times,
              target: st.start,
            })
            parseStack.pop()
            if (code !== 'endewiederhole') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "endewiederhole" fehlt.',
              })
            }
          } else if (st.type == 'repeat' && st.stage == 11) {
            st.op.target = output.length
            output.push({
              type: 'jumpcond',
              targetT: st.start,
              targetF: output.length + 1,
              condition: st.condition,
            })
            parseStack.pop()
            if (code !== 'endewiederhole') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "endewiederhole" fehlt.',
              })
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Wiederholung',
            })
          }
        }
        if (cursor.name == 'Cmd') {
          parseStack.push({
            type: 'function',
            target: output.length + 1,
            stage: 0,
          })
        }
        if (cursor.name == 'CmdStart') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'function' && st.stage == 0) {
            st.stage = 1
            if (code !== 'Anweisung') {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Schlüsselwort "Anweisung" fehlt',
              })
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Anweisung',
            })
          }
        }
        if (cursor.name == 'CmdName') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'function' && st.stage == 1) {
            if (declarations[code]) {
              warnings.push({
                from: cursor.from,
                to: cursor.to,
                severity: 'error',
                message: 'Anweisung mit diesem Namen bereits vorhanden',
              })
            } else {
              st.stage = 2
              st.name = code
              const op: Op = { type: 'jumpn', count: Infinity, target: -1 }
              output.push(op)
              st.skipper = op
            }
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Anweisung',
            })
          }
        }
        if (cursor.name == 'CmdEnd') {
          const st = parseStack[parseStack.length - 1]
          if (st.type == 'function' && st.stage == 2) {
            declarations[st.name] = { target: st.target }
            output.push({ type: 'return' })
            st.skipper.target = output.length
          } else {
            warnings.push({
              from: cursor.from,
              to: cursor.to,
              severity: 'error',
              message: 'ungültige Anweisung',
            })
          }
        }
        if (cursor.type.isError) {
          warnings.push({
            from: cursor.from - 2,
            to: Math.min(cursor.to + 2, view.state.doc.length - 1),
            severity: 'error',
            message: 'Fehler',
          })
        }
      } while (cursor.next())
    }
    for (const f of functions) {
      if (declarations[f.code]) {
        f.op.target = declarations[f.code].target
      } else {
        warnings.push({
          from: f.from,
          to: f.to,
          severity: 'error',
          message: `"${f.code}" ist kein bekannter Befehl`,
        })
      }
    }
    if (warnings.length == 0) {
      this.mutate((state) => {
        state.vm.bytecode = output
        state.vm.pc = 0
        state.ui.state = 'ready'
      })
    } else {
      this.mutate((state) => {
        state.vm.bytecode = undefined
        state.vm.pc = 0
        state.ui.state = 'error'
      })
    }
    return warnings
  }

  setLoading() {
    if (this.current.ui.state == 'running') {
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
      vm.checkpoint = this.current.world
      vm.pc = vm.entry
      vm.frames = [{}]
    })
    //console.log(this.current.vm.bytecode)
    setTimeout(this.step.bind(this), 500)
  }

  step() {
    const pc = this.current.vm.pc
    const byteCode = this.current.vm.bytecode
    const state = this.current.ui.state

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

    if (op.type == 'action') {
      this.mutate((state) => {
        state.ui.gutter = op.line
      })

      const delay =
        this.current.settings.speed == 'slow'
          ? 500
          : this.current.settings.speed == 'fast'
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
          if (this.current.settings.speed !== 'step') {
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
        const frame = this.current.vm.frames[this.current.vm.frames.length - 1]
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
        this.mutate(({ vm }) => {
          vm.callstack.push(vm.pc + 1)
          vm.frames.push({})
          vm.pc = op.target
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
        this.mutate(({ vm }) => {
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
    const { x, y, dir } = this.current.world.karol
    if (cond.type == 'mark') {
      const val = this.current.world.marks[y][x]
      if (cond.negated) {
        return !val
      }
      return val
    } else if (cond.type == 'wall') {
      const newpos = move(x, y, dir, this.current.world)
      if (cond.negated) {
        return !!newpos
      }
      return !newpos
    } else {
      const newpos = moveRaw(x, y, dir, this.current.world)
      if (!newpos) {
        return cond.negated ? true : false
      } else {
        const count = this.current.world.bricks[newpos.y][newpos.x]
        return cond.negated ? count == 0 : count > 0
      }
    }
  }

  serialize() {
    const { world, code } = this.current
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
  setSpeedHot(val: Speed) {
    clearTimeout(this.current.vm.handler!)
    this.setSpeed(val)
    if (val != 'step' && this.current.ui.state == 'running') {
      this.step()
    }
  }

  setSpeed(val: Speed) {
    this.mutate((state) => {
      state.settings.speed = val
    })
  }

  abort() {
    clearTimeout(this.current.vm.handler!)
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

function getDefaultCoreState(): CoreState {
  return {
    world: createWorld(5, 10, 6),
    code: '',
    ui: {
      messages: [],
      gutter: 0,
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
