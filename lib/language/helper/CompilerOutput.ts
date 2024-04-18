import { Diagnostic } from '@codemirror/lint'
import { Op } from '../../state/types'
import { AstNode } from './astNode'

export interface AnchorOp {
  type: 'anchor'
  callback: (target: number) => void
}

export interface CompilerResult {
  output: Op[]
  warnings: Diagnostic[]
  proMode?: boolean
  rkCode?: string
}

export class CompilerOutput {
  private warnings: Diagnostic[] = []
  private output: (Op | AnchorOp)[] = []

  private rkCode = ''
  private rkCodeIndent = 0

  private proMode = false

  private comments: AstNode[] = []

  private pad() {
    let line = ''
    for (let i = 0; i < this.rkCodeIndent; i++) {
      line += '  '
    }
    return line
  }

  constructor() {}

  registerComments(nodes: AstNode[]) {
    this.comments = nodes
  }

  appendRkCode(code: string, pos: number) {
    const commentsToAdd = this.comments.filter((node) => node.from < pos)
    for (const c of commentsToAdd) {
      this.rkCode += '\n' + this.pad() + c.text()
    }
    if (commentsToAdd.length > 0) {
      this.comments = this.comments.filter((node) => node.from >= pos)
    }
    this.rkCode += '\n' + this.pad() + code
  }

  appendOutput(op: Op | AnchorOp) {
    this.output.push(op)
  }

  warn(warning: { from: number; to: number; message: string }) {
    this.warnings.push({
      from: warning.from,
      to: warning.to,
      severity: 'error',
      message: warning.message,
    })
  }

  increaseIndent() {
    this.rkCodeIndent++
  }

  decreaseIndent() {
    this.rkCodeIndent--
  }

  activateProMode() {
    this.proMode = true
  }

  hasWarnings() {
    return this.warnings.length > 0
  }

  fatalResult() {
    return { output: [], warnings: this.warnings }
  }

  getPosition() {
    return this.output.length
  }

  getOpAt(offset: number) {
    return this.output[offset]
  }

  getResult() {
    // flush remaining comments
    this.appendRkCode('', Infinity)

    this.rkCode = this.rkCode.trim()

    const finalOutput: Op[] = []

    for (const op of this.output) {
      if (op.type == 'anchor') {
        op.callback(finalOutput.length)
      } else {
        finalOutput.push(op)
      }
    }

    return {
      output: finalOutput,
      warnings: this.warnings,
      proMode: this.proMode,
      rkCode: this.proMode ? undefined : this.rkCode,
    }
  }
}
