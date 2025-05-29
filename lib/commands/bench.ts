import { Core } from '../state/core'
import { ObjectInfo } from '../state/types'

export function exitBench(core: Core) {
  core.mutateWs((ws) => {
    ws.__activeRobot = 0
  })
  core.mutateWs(({ ui }) => {
    ui.isBench = false
    ui.state = 'ready'
  })
  core.worker!.reset()
}

export async function startBench(core: Core) {
  await core.worker!.prepareBench()
  core.mutateWs((ws) => {
    ws.ui.isBench = true
    ws.world = ws.quest.tasks[0].start
    ws.ui.showOutput = true
    ws.quest.lastStartedTask = 0
    ws.ui.state = 'running'
    ws.bench.objects = []
    ws.bench.locked = false
    ws.bench.history =
      filterCodeForHistory(core.ws.pythonCode) + '\n# Interaktiver Modus'
    ws.ui.karolCrashMessage = undefined
    ws.ui.isEndOfRun = false
    ws.ui.isManualAbort = false
    ws.ui.messages = []
  })
  await executeInBench(core, core.ws.pythonCode)
  await updateBenchClasses(core)
  await updateBenchObjects(core)
}

// Function to filter out comments, empty lines, and definitions
function filterCodeForHistory(code: string): string {
  if (!code) return ''

  const lines = code.split('\n')
  const filteredLines: string[] = []
  let skipBlock = false
  let indentLevel = 0
  let inTripleQuoteString = false
  let tripleQuoteType = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Check for triple quotes
    if (!inTripleQuoteString) {
      if (trimmedLine.includes('"""') || trimmedLine.includes("'''")) {
        tripleQuoteType = trimmedLine.includes('"""') ? '"""' : "'''"
        // Check if triple quotes open and close on same line
        const firstIndex = trimmedLine.indexOf(tripleQuoteType)
        const lastIndex = trimmedLine.lastIndexOf(tripleQuoteType)
        if (firstIndex !== lastIndex) {
          continue // Triple quote opens and closes on same line, skip it entirely
        } else {
          inTripleQuoteString = true
          continue
        }
      }
    } else {
      // If we're in a triple quoted string, check if it ends on this line
      if (trimmedLine.includes(tripleQuoteType)) {
        inTripleQuoteString = false
      }
      continue // Skip all lines within triple quotes
    }

    // Skip empty lines and comments regardless
    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue
    }

    // Calculate indent level based on leading spaces (assuming 2 or 4 spaces per indent)
    const leadingSpaces = line.length - line.trimStart().length
    const currentIndent = Math.floor(leadingSpaces / 2)

    // If we're at a new definition (class or function)
    if (trimmedLine.startsWith('class ') || trimmedLine.startsWith('def ')) {
      skipBlock = true
      indentLevel = currentIndent
      continue
    }

    // If we're still in a block that should be skipped
    if (skipBlock) {
      // If this line has less indentation than the block start, we've exited the block
      if (currentIndent <= indentLevel && trimmedLine !== '') {
        skipBlock = false
      } else {
        continue
      }
    }

    // If we reach here, the line should be included
    if (!skipBlock && !inTripleQuoteString) {
      filteredLines.push(line)
    }
  }

  return filteredLines.join('\n').trim()
}

export async function executeInBench(core: Core, code: string) {
  core.mutateWs((ws) => {
    ws.bench.locked = true
  })
  const result = await core.worker!.messageBench({
    request: 'execute',
    code,
  })
  core.mutateWs((ws) => {
    ws.bench.locked = false
  })
  await updateBenchObjects(core)
  return result
}

export async function updateBenchClasses(core: Core) {
  const result = (await core.worker!.messageBench({
    request: 'class-info',
  })) as any
  core.mutateWs((ws) => {
    const classInfo = JSON.parse(result.classInfo)
    // For each class, sort its methods
    for (const className in classInfo) {
      if (classInfo[className].methods) {
        classInfo[className].methods = Object.fromEntries(
          Object.entries(classInfo[className].methods).sort(
            ([, a]: any, [, b]: any) => {
              // If a's origin matches className and b's doesn't, a comes first
              if (a.origin === className && b.origin !== className) return -1
              // If b's origin matches className and a's doesn't, b comes first
              if (b.origin === className && a.origin !== className) return 1
              // Otherwise keep original order
              return 0
            }
          )
        )
      }
    }
    ws.bench.classInfo = classInfo
  })
}

export async function updateBenchObjects(core: Core) {
  const result = (await core.worker!.messageBench({
    request: 'object-info',
  })) as any
  core.mutateWs((ws) => {
    ws.bench.objects = JSON.parse(result.classInfo)
      .map((obj: [string, string]) => {
        return {
          name: obj[0],
          className: obj[1],
        }
      })
      .filter((obj: ObjectInfo) => {
        return core.ws.bench.classInfo[obj.className] !== undefined
      })
  })
}
