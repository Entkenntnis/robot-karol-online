import { MutableRefObject, useEffect, useRef } from 'react'
import {
  indentSelection,
  simplifySelection,
  cursorLineUp,
  cursorLineEnd,
  cursorCharLeft,
  insertNewlineAndIndent,
} from '@codemirror/commands'
import { EditorState, Transaction } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { basicSetup } from '../lib/codemirror/basicSetup'
import { useCore } from '../lib/state/core'
import { lint, setLoading } from '../lib/commands/editing'

// make tailwind happy
// text-[#9a4603]

interface EditorProps {
  innerRef: MutableRefObject<EditorView | undefined>
}

export const Editor = ({ innerRef }: EditorProps) => {
  const editorDiv = useRef(null)
  const core = useCore()

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const view: EditorView = new EditorView({
        state: EditorState.create({
          doc: core.ws.code,
          extensions: [
            basicSetup({
              l: () => {
                return lint(core, view)
              },
            }),
            EditorView.updateListener.of((e) => {
              if (e.docChanged) {
                if (!e.state.doc.sliceString(0).endsWith('\n')) {
                  view.dispatch({
                    changes: { from: e.state.doc.length, insert: '\n' },
                  })
                }
              }
              //onUpdate(e.state.doc.sliceString(0))
              if (e.transactions.length > 0) {
                const t = e.transactions[0]

                if (t.docChanged) {
                  if (core.ws.ui.state == 'ready') {
                    setLoading(core)
                  }
                }

                const annotations = (t as any).annotations as {
                  value: string
                }[]
                if (annotations.some((a) => a.value == 'drop')) {
                  indentSelection(view)
                  simplifySelection(view)
                  indentSelection(view)

                  if (
                    (t as any).changes.inserted.some((x: any) =>
                      x.text.some((x: any) => x.includes('wiederhole solange'))
                    )
                  ) {
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorLineEnd(view)
                  } else if (
                    (t as any).changes.inserted.some((x: any) =>
                      x.text.some((x: any) => x.includes('wiederhole immer'))
                    )
                  ) {
                    cursorLineUp(view)
                  } else if (
                    (t as any).changes.inserted.some(
                      (x: any) =>
                        x.text?.some((x: any) => x.includes('wenn  dann')) &&
                        x.text.length == 3
                    )
                  ) {
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                  } else if (
                    (t as any).changes.inserted.some(
                      (x: any) =>
                        x.text?.some((x: any) => x.includes('wenn  dann')) &&
                        x.text.length == 5
                    )
                  ) {
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                  } else {
                    t.changes.iterChanges((from, to, fromB, toB, inserted) => {
                      if (
                        [
                          'Schritt',
                          'LinksDrehen',
                          'RechtsDrehen',
                          'Hinlegen',
                          'Aufheben',
                          'MarkeSetzen',
                          'MarkeLöschen',
                        ].includes(inserted.toString())
                      ) {
                        const line = t.newDoc.lineAt(fromB)
                        const col = fromB - line.from
                        if (col == 0) {
                          insertNewlineAndIndent(view)
                        }
                      }
                    })
                  }
                }
              }
            }),
          ],
        }),
        parent: currentEditor,
      })

      innerRef.current = view

      return () => view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorDiv])

  return <div ref={editorDiv} />
}
