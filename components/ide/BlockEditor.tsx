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
      renderer: 'thrasos',
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

    const myUpdateFunction = () => {
      if (blocklyWorkspace.isDragging()) return

      //console.log(Blockly.Xml.workspaceToDom(blocklyWorkspace))

      const newCode = (Blockly as any).karol.workspaceToCode(
        // strange monkey patch
        blocklyWorkspace
      ) as string

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

      const topBlocks = blocklyWorkspace
        .getTopBlocks(false)
        .filter((bl) => !(bl as any).isInsertionMarker_) // hm, bypassing protection
        .filter((bl) => bl.type !== 'define_command')

      core.mutateWs(({ ui }) => {
        blocklyWorkspace
          .getTopBlocks(false)
          .filter((bl) => bl.type === 'define_command')
          .forEach((block) => {
            const name = block.getFieldValue('COMMAND')
            const { top, left } = block.getBoundingRectangle()
            ui.cmdBlockPositions[name] = { x: left, y: top }
          })
      })

      if (topBlocks.length > 1) {
        if (core.ws.ui.state == 'running') {
          abort(core)
        }
        core.mutateWs((ws) => {
          ws.ui.state = 'error'
          ws.ui.errorMessages = [core.strings.ide.connectAll]
        })
      } else {
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
