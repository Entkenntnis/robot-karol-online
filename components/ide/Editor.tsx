import { RefObject, useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { basicSetup } from '../../lib/codemirror/basicSetup'
import { useCore } from '../../lib/state/core'
import { lint, setLoading } from '../../lib/commands/editing'

// make tailwind happy
// text-[#9a4603]

interface EditorProps {
  innerRef: RefObject<EditorView | undefined>
}

export const Editor = ({ innerRef }: EditorProps) => {
  const editorDiv = useRef(null)
  const core = useCore()

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const doc = core.ws.code
      const lng = core.ws.settings.lng
      const view: EditorView = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [
            basicSetup({
              l: () => {
                return lint(core, view)
              },
              lng,
              core,
            }),
            EditorView.updateListener.of((e) => {
              if (e.docChanged) {
                /*if (!e.state.doc.sliceString(0).endsWith('\n')) {
                  view.dispatch({
                    changes: { from: e.state.doc.length, insert: '\n' },
                  })
                }*/
              }
              //onUpdate(e.state.doc.sliceString(0))
              if (e.transactions.length > 0) {
                const t = e.transactions[0]

                if (t.docChanged) {
                  if (core.ws.ui.state == 'ready') {
                    setLoading(core)
                  }
                }
              }
            }),
          ],
        }),
        scrollTo: EditorView.scrollIntoView(0),
        parent: currentEditor,
      })

      innerRef.current = view

      return () => view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorDiv, core.ws.settings.lng])

  return <div ref={editorDiv} className="h-full" />
}
