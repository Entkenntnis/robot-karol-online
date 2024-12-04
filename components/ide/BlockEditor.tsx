import Blockly, { WorkspaceSvg } from 'blockly'
import { useRef, useState, useEffect } from 'react'
import { Text } from '@codemirror/state'
import De from 'blockly/msg/de'
import En from 'blockly/msg/en'

import '../../lib/blockly/FieldNumberSlider'
import { codeToXml } from '../../lib/blockly/codeToXml'
import { initCustomBlocks } from '../../lib/blockly/customBlocks'
import { KAROL_TOOLBOX } from '../../lib/blockly/toolbox'
import { abort, patch } from '../../lib/commands/vm'
import { compile } from '../../lib/language/robot karol/compiler'
import { useCore } from '../../lib/state/core'
import { initCustomBlocksEn } from '../../lib/blockly/customBlocksEn'
import { getParserWithLng } from '../../lib/codemirror/parser/get-parser-with-lng'
import { CmdBlocksStore } from '../../lib/state/cmd-blocks-store'
import { BlockChange } from 'blockly/core/events/events_block_change'
import { saveCodeToLocalStorage } from '../../lib/commands/save'

export function BlockEditor() {
  const editorDiv = useRef<HTMLDivElement>(null)
  const [blockIds, setBlockIds] = useState<(string | null)[]>([])
  const blocklyWorkspaceSvg = useRef<WorkspaceSvg | null>(null)
  const core = useCore()
  const code = useRef('')
  Blockly.setLocale(core.ws.settings.lng == 'de' ? De : En)
  if (core.ws.settings.lng == 'de') {
    initCustomBlocks()
  } else {
    initCustomBlocksEn()
  }

  // console.log('render component')

  if (
    blocklyWorkspaceSvg.current &&
    core.ws.ui.state == 'running' &&
    core.ws.ui.gutter
  ) {
    if (blockIds[core.ws.ui.gutter - 1]) {
      blocklyWorkspaceSvg.current.highlightBlock(
        blockIds[core.ws.ui.gutter - 1] ?? ''
      )
    }
  }

  useEffect(() => {
    if (
      blocklyWorkspaceSvg.current &&
      core.ws.ui.state != 'running' &&
      !core.ws.ui.karolCrashMessage
    ) {
      blocklyWorkspaceSvg.current.highlightBlock('')
    }
  }, [core.ws.ui.karolCrashMessage, core.ws.ui.state])

  useEffect(() => {
    if (!editorDiv.current) {
      alert('Internal error. Unable to inject blockly.')
      return
    }
    //console.log('inject blockly')

    const initialXml = codeToXml(
      core.ws.code,
      core.ws.ui.cmdBlockPositions,
      core.ws.ui.snippets,
      core.ws.settings.lng
    )

    //console.log('initial', initialXml)

    const blocklyWorkspace = Blockly.inject(editorDiv.current, {
      toolbox: KAROL_TOOLBOX,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
      },
      scrollbars: true,
      trashcan: false,
      move: {
        drag: true,
        wheel: true,
      },
      media: '/blockly_media/',
    })

    blocklyWorkspaceSvg.current = blocklyWorkspace

    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom(initialXml),
      blocklyWorkspace
    )

    const blocklyArea = document.getElementById('blocklyArea')!
    const blocklyDiv = document.getElementById('blocklyDiv')!

    const onresize = function () {
      //console.log('on resize function')
      // Compute the absolute coordinates and dimensions of blocklyArea.
      let element = blocklyArea
      let x = 0
      let y = 0
      do {
        x += element.offsetLeft
        y += element.offsetTop
        element = element.offsetParent as HTMLElement
      } while (element)
      // Position blocklyDiv over blocklyArea.
      blocklyDiv.style.left = x + 'px'
      blocklyDiv.style.top = y + 'px'
      blocklyDiv.style.width = blocklyArea.offsetWidth + 'px'
      blocklyDiv.style.height = blocklyArea.offsetHeight + 'px'
      // console.log('resize')
      Blockly.svgResize(blocklyWorkspace)
    }
    window.addEventListener('resize', onresize, false)
    onresize()

    blocklyWorkspace.scroll(30, 36)

    core.blockyResize = onresize
    //console.log('mount', core.blockyResize)

    const myUpdateFunction = (event: BlockChange) => {
      if (blocklyWorkspace.isDragging()) return

      try {
        if (event.type == 'change' && event.name == 'COMMAND_NAME') {
          blocklyWorkspace
            .getAllBlocks(false)
            .filter((bl) => bl.type == 'custom_command')
            .forEach((bl) => {
              if (bl.getFieldValue('COMMAND') == event.oldValue) {
                // we are accessing internal field to bybass validator
                // options are re-generated anyways
                ;(bl.getField('COMMAND') as any).generatedOptions_.push([
                  event.newValue,
                  event.newValue,
                ])
                bl.setFieldValue(event.newValue, 'COMMAND')
              }
            })
        }
      } catch (e) {
        console.log('auto-update failed', e)
      }

      const allTopBlocks = blocklyWorkspace
        .getTopBlocks(true)
        .filter((bl) => !(bl as any).isInsertionMarker_) // hm, bypassing protection

      //console.log(Blockly.Xml.workspaceToDom(blocklyWorkspace))
      const topBlocks = allTopBlocks.filter(
        (bl) => bl.type !== 'define_command'
      )

      const cmdBlocks = allTopBlocks.filter((bl) => bl.type == 'define_command')

      const mainBlocks = topBlocks.filter((bl) => bl.type == 'main')

      let names: string[] = []
      core.mutateWs(({ ui }) => {
        cmdBlocks.forEach((block) => {
          const name = block.getFieldValue('COMMAND_NAME')
          if (name) {
            names.push(name)
          }
          const { top, left } = block.getBoundingRectangle()
          ui.cmdBlockPositions[name] = { x: left, y: top }
        })
      })
      CmdBlocksStore.update((s) => {
        s.names = names
      })

      if (topBlocks.length > 1) {
        let error = ''
        if (mainBlocks.length > 1) {
          error = core.strings.ide.multipleMains
        } else if (mainBlocks.length == 0) {
          error = core.strings.ide.connectAll
        }

        if (error) {
          if (core.ws.ui.state == 'running') {
            abort(core)
          }
          core.mutateWs((ws) => {
            ws.ui.state = 'error'
            ws.ui.errorMessages = [error]
          })
          return
        }
      }

      let counter = 1

      core.mutateWs((ws) => {
        ws.ui.snippets = []
      })

      const newCode =
        mainBlocks.length == 1
          ? (Blockly as any).karol.blockToCode(mainBlocks[0]) +
            '\n' +
            cmdBlocks
              .map((bl) => (Blockly as any).karol.blockToCode(bl) as string)
              .join('\n') +
            '\n' +
            topBlocks
              .filter((bl) => bl.type !== 'main')
              .map((bl) => {
                core.mutateWs((ws) => {
                  ws.ui.snippets.push(
                    (Blockly.Xml.blockToDomWithXY(bl) as HTMLElement).outerHTML
                  )
                })
                return `// Schnipsel ${counter++}\n${(
                  (Blockly as any).karol.blockToCode(bl).toString() as string
                )
                  .split('\n')
                  .map((x) => `// ${x}`)
                  .join('\n')}\n// endeSchnipsel\n`
              })
              .join('\n')
          : ((Blockly as any).karol.workspaceToCode(
              // strange monkey patch
              blocklyWorkspace
            ) as string)

      setBlockIds(
        newCode.split('\n').map((line) => {
          if (line.includes('//blockId:')) {
            return line.substring(line.length - 20)
          } else {
            return null
          }
        })
      )

      if (core.ws.ui.state == 'running') {
        if (code.current !== newCode) {
          console.log('abort because code changed')
          abort(core)
          return
        }
      }

      code.current = newCode

      core.mutateWs((ws) => {
        ws.code = newCode
          .replace(/\/\/blockId:.*$/gm, '')
          .replace(/\n\n\n/g, '\n\n')
          .replace(/^\n/, '')
          .replace(/\n$/, '')
      })
      saveCodeToLocalStorage(core)

      if (core.ws.ui.state == 'running') {
        return // don't patch while running of code hasn't changed
      }
      const doc = Text.of(newCode.split('\n'))
      const tree = getParserWithLng(core.ws.settings.lng).parse(newCode)
      const { warnings, output } = compile(tree, doc, core.ws.settings.lng)

      //console.log(warnings, output)

      if (warnings.length == 0) {
        patch(core, output)
      } else {
        core.mutateWs(({ vm, ui }) => {
          vm.bytecode = undefined
          vm.pc = 0
          ui.state = 'error'
          ui.errorMessages = warnings
            .map(
              (w) =>
                `${core.strings.ide.line} ${doc.lineAt(w.from).number}: ${
                  w.message
                }`
            )
            .filter(function (item, i, arr) {
              return arr.indexOf(item) == i
            })
        })
      }

      setTimeout(onresize, 0)
    }
    blocklyWorkspace.addChangeListener(myUpdateFunction)

    return () => {
      blocklyWorkspace.removeChangeListener(myUpdateFunction)
      blocklyWorkspace.dispose()
      // console.log('dispose')
      core.blockyResize = undefined
      window.removeEventListener('resize', onresize)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core.ws.settings.lng])

  return (
    <>
      <div id="blocklyArea" className="w-full h-full flex-shrink">
        <div className="absolute" ref={editorDiv} id="blocklyDiv" />
      </div>
      <style jsx global>{`
        #blocklyArea svg[display='none'] {
          display: none;
        }
        .blocklyMenu {
          box-sizing: content-box;
        }
      `}</style>
    </>
  )
}
